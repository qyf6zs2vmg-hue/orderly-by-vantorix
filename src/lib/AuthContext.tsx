import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getTelegramWebApp } from './telegram';

interface AppUser {
  uid: string;
  email: string;
  role: 'owner' | 'client';
  status: 'pending' | 'active' | 'blocked';
  businessId?: string;
  name: string;
  telegramId?: number;
}

interface BusinessData {
  id: string;
  name: string;
  ownerId?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  business: BusinessData | null;
  loading: boolean;
  authError: string | null;
  logout: () => Promise<void>;
  retryAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  business: null,
  loading: true,
  authError: null,
  logout: async () => {},
  retryAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retryAuth = () => setRetryTrigger(prev => prev + 1);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      try {
        tg.ready();
        tg.expand();
        // Set theme variables 
        document.documentElement.style.setProperty('--bg-base', tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--text-main', tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--surface', tg.themeParams.secondary_bg_color || '#f4f4f5');
      } catch (e) {
        console.error("Telegram init error:", e);
      }
    }
  }, []);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let isCancelled = false;
    let authTimeout: any = null;
    
    // Attempt Telegram auto-login separately from onAuthStateChanged
    // because if firebaseUser is null initially, we want to actively try to authorize.
    const authenticateWithTelegram = async () => {
       const tg = getTelegramWebApp();
       console.log("Init Data:", tg?.initData);
       const tgUser = tg?.initDataUnsafe?.user;
       
       if (!tgUser) {
         if (!isCancelled) {
           setUser(null);
           setAppUser(null);
           setBusiness(null);
           // Only set error if TG is actually initialized but missing user (rare). 
           // If tg is completely missing, it's just a browser visit.
           if (tg && tg.initData) {
             setAuthError("Ошибка: не удалось получить профиль пользователя. Попробуйте перезапустить Mini App.");
           } else {
             setAuthError(null);
           }
           setLoading(false);
         }
         return;
       }

       if (!isCancelled) {
         setLoading(true);
         setAuthError(null);
       }

       try {
         // Setup timeout for auth
         const authPromise = (async () => {
            const email = `telegram_${tgUser.id}@orderflow.internal`;
            const password = `tg_secret_${tgUser.id}_#orderflow`;
            console.log("Auth Request Payload:", { email, telegramId: tgUser.id });
            try {
               const result = await signInWithEmailAndPassword(auth, email, password);
               console.log("Auth Response (Sign In Success):", result.user.uid);
               return true;
            } catch (err: any) {
               if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                  console.log("Target user not found, executing rapid registration.");
                  const cred = await createUserWithEmailAndPassword(auth, email, password);
                  console.log("Auth Response (Reg Success):", cred.user.uid);
                  // Determine if there's a start_param for invite
                  const startParam = tg.initDataUnsafe?.start_param;
                  let businessId: string | null = null;
                  
                  if (startParam) {
                     try {
                       const inviteRef = doc(db, 'invites', startParam);
                       const inviteDoc = await getDoc(inviteRef);
                       if (inviteDoc.exists()) {
                          const data = inviteDoc.data();
                          if (!data.blocked && !data.used) {
                             businessId = data.businessId;
                             await updateDoc(inviteRef, { used: true });
                          }
                       }
                     } catch (e) {
                       console.error("Invite processing failed", e);
                     }
                  }
                  
                  await setDoc(doc(db, 'users', cred.user.uid), {
                      name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'Telegram User',
                      email: email,
                      role: 'client',
                      status: businessId ? 'pending' : 'active',
                      businessId: businessId,
                      telegramId: tgUser.id
                  });
                  return true;
               } else {
                 throw err;
               }
            }
         })();

         const timeoutPromise = new Promise((_, reject) => {
            authTimeout = setTimeout(() => reject(new Error("Timeout")), 10000);
         });

         await Promise.race([authPromise, timeoutPromise]);
         // Wait for onAuthStateChanged to pick up the user, so we don't setLoading(false) here,
         // unless it failed.
       } catch (err: any) {
         console.error("Telegram auto-login failed:", err);
         if (!isCancelled) {
           setAuthError(err.message === "Timeout" ? "Превышено время ожидания авторизации." : "Ошибка авторизации. Попробуйте еще раз.");
           setLoading(false);
         }
       } finally {
         if (authTimeout) clearTimeout(authTimeout);
       }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!isCancelled) {
           setUser(firebaseUser);
           setAuthError(null);
        }
        
        let hasFiredSnapshot = false;
        const snapshotTimeout = setTimeout(() => {
           if (!hasFiredSnapshot && !isCancelled) {
              setAuthError("Время ожидания профиля истекло. Проверьте сеть или повторите попытку.");
              setLoading(false);
           }
        }, 12000);
        
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), async (userDoc) => {
          if (isCancelled) return;
          hasFiredSnapshot = true;
          clearTimeout(snapshotTimeout);
          setAuthError(null);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<AppUser, 'uid'>;
            setAppUser({ uid: firebaseUser.uid, ...userData });
            
            if (userData.businessId) {
              try {
                const busDoc = await getDoc(doc(db, 'businesses', userData.businessId));
                if (!isCancelled) {
                   if (busDoc.exists()) {
                     setBusiness({ id: busDoc.id, ...busDoc.data() } as BusinessData);
                   } else {
                     setBusiness(null);
                   }
                }
              } catch (err) {
                console.error("Error fetching business:", err);
                if (!isCancelled) setBusiness(null);
              }
            } else {
              if (!isCancelled) setBusiness(null);
            }
          } else {
            if (!isCancelled) {
               setAppUser(null);
               setBusiness(null);
            }
          }
          if (!isCancelled) setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          if (!isCancelled) {
             clearTimeout(snapshotTimeout);
             setAppUser(null);
             setBusiness(null);
             setLoading(false);
          }
        });
      } else {
         // User is logged out, trigger authenticateWithTelegram
         authenticateWithTelegram();
        
         if (unsubscribeDoc) {
           unsubscribeDoc();
           unsubscribeDoc = null;
         }
      }
    });

    return () => {
      isCancelled = true;
      if (authTimeout) clearTimeout(authTimeout);
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [retryTrigger]);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, appUser, business, loading, authError, logout, retryAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
