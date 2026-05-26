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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  business: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();
      // Set theme variables 
      document.documentElement.style.setProperty('--bg-base', tg.themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--text-main', tg.themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--surface', tg.themeParams.secondary_bg_color || '#f4f4f5');
    }
  }, []);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<AppUser, 'uid'>;
            setAppUser({ uid: firebaseUser.uid, ...userData });
            
            if (userData.businessId) {
              try {
                const busDoc = await getDoc(doc(db, 'businesses', userData.businessId));
                if (busDoc.exists()) {
                  setBusiness({ id: busDoc.id, ...busDoc.data() } as BusinessData);
                } else {
                  setBusiness(null);
                }
              } catch (err) {
                console.error("Error fetching business:", err);
                setBusiness(null);
              }
            } else {
              setBusiness(null);
            }
          } else {
            setAppUser(null);
            setBusiness(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user data:", error);
          setAppUser(null);
          setBusiness(null);
          setLoading(false);
        });
      } else {
        // Attempt Telegram auto-login
        const tg = getTelegramWebApp();
        const tgUser = tg?.initDataUnsafe?.user;
        if (tgUser) {
           const email = `telegram_${tgUser.id}@orderflow.internal`;
           const password = `tg_secret_${tgUser.id}_#orderflow`;
           try {
              await signInWithEmailAndPassword(auth, email, password);
           } catch (err: any) {
              if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                 try {
                    const cred = await createUserWithEmailAndPassword(auth, email, password);
                    // Determine if there's a start_param for invite
                    const startParam = tg.initDataUnsafe?.start_param;
                    let businessId = null;
                    let role = 'client';
                    
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
                        role: role,
                        status: businessId ? 'pending' : 'active',
                        businessId: businessId,
                        telegramId: tgUser.id
                    });
                 } catch (createErr) {
                    console.error("Telegram auto-signup failed", createErr);
                    setLoading(false);
                 }
              } else {
                console.error("Telegram auto-login failed", err);
                setLoading(false);
              }
           }
        } else {
          setUser(null);
          setAppUser(null);
          setBusiness(null);
          setLoading(false);
        }
        
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, appUser, business, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
