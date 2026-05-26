import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection } from 'firebase/firestore';
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
  onboardingState: 'landing' | 'auth' | 'register' | 'creating_system' | 'dashboard';
  setOnboardingState: (s: 'landing' | 'auth' | 'register' | 'creating_system' | 'dashboard') => void;
  startAuth: () => Promise<void>;
  completeRegistration: (name: string, companyName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  business: null,
  loading: true,
  authError: null,
  logout: async () => {},
  retryAuth: () => {},
  onboardingState: 'landing',
  setOnboardingState: () => {},
  startAuth: async () => {},
  completeRegistration: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [onboardingState, setOnboardingState] = useState<'landing' | 'auth' | 'register' | 'creating_system' | 'dashboard'>('landing');

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

  const startAuth = async () => {
    setOnboardingState('auth');
    setAuthError(null);
    setLoading(true);

    const tg = getTelegramWebApp();
    console.log("Start Onboarding Auth - Telegram Init data:", tg?.initData);
    const tgUser = tg?.initDataUnsafe?.user;

    // Fast track if already authenticated and profile loaded
    if (auth.currentUser && appUser) {
      console.log("User already logged on and profile fetched, moving to dashboard");
      setOnboardingState('dashboard');
      setLoading(false);
      return;
    }

    if (!tgUser) {
      console.log("No Telegram WebApp user detected, executing Developer Sandbox Auth Simulation.");
      // For development preview / AIS browser visits, let's use a standard developer account
      const email = `sandbox_owner@orderflow.internal`;
      const password = `sandbox_secret_owner_#orderflow`;
      
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Sandbox environment: Signed in successfully.");
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          console.log("Sandbox environment: Creating new default sandbox user.");
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          console.error("Sandbox Auth Error:", err);
          setAuthError(`Sandbox Auth Error: ${err.message}`);
          setOnboardingState('landing');
          setLoading(false);
        }
      }
      return;
    }

    const email = `telegram_${tgUser.id}@orderflow.internal`;
    const password = `tg_secret_${tgUser.id}_#orderflow`;
    console.log("Telegram Auth Payload:", { email, userId: tgUser.id });

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase Auth Sign In Success");
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        console.log("User not found in Firebase, executing initial sign-up.");
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          console.log("Firebase Auth Sign Up Success:", cred.user.uid);
        } catch (regErr: any) {
          console.error("Firebase Sign Up Error:", regErr);
          setAuthError(`Ошибка при создании пользователя: ${regErr.message}`);
          setOnboardingState('landing');
          setLoading(false);
        }
      } else {
        console.error("Firebase Sign In Error:", err);
        setAuthError(`Ошибка авторизации: ${err.message}`);
        setOnboardingState('landing');
        setLoading(false);
      }
    }
  };

  const completeRegistration = async (name: string, companyName?: string) => {
    setOnboardingState('creating_system');
    setLoading(true);

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setAuthError("Аутентификация отсутствует. Пожалуйста, вернитесь на экран входа.");
      setOnboardingState('landing');
      setLoading(false);
      return;
    }

    const tg = getTelegramWebApp();
    const tgUser = tg?.initDataUnsafe?.user;
    const startParam = tg?.initDataUnsafe?.start_param;

    try {
      let businessId = "";
      let role: 'owner' | 'client' = 'owner';
      let status: 'active' | 'pending' = 'active';

      if (startParam) {
        console.log("Processing invitation join request for start_param:", startParam);
        role = 'client';
        status = 'pending';
        try {
          const inviteRef = doc(db, 'invites', startParam);
          const inviteDoc = await getDoc(inviteRef);
          if (inviteDoc.exists()) {
            const data = inviteDoc.data();
            if (!data.blocked && !data.used) {
              businessId = data.businessId || "";
              await updateDoc(inviteRef, { used: true });
              console.log("Invite applied successfully for businessId:", businessId);
            } else {
              console.warn("Invite link is already used or blocked!");
            }
          } else {
             console.warn("Invite document does not exist in collection!");
          }
        } catch (e: any) {
          console.error("Invite code check error:", e);
        }
      } else {
        console.log("No invitation start_param, registering as owner. Company Name:", companyName);
        role = 'owner';
        status = 'active';

        // Provision a new business
        const businessRef = doc(collection(db, 'businesses'));
        businessId = businessRef.id;
        
        await setDoc(businessRef, {
          name: companyName || "OrderFlow Workspace",
          ownerId: firebaseUser.uid,
          createdAt: new Date().toISOString()
        });
        console.log("Business provisioned with ID:", businessId);

        // Seed initial trial items for SaaS workspace
        const seedProducts = [
          { name: "OrderFlow Smart Hub", price: 24900, stock: 15, code: "OF-HUB-01" },
          { name: "BlackBridge Node API Mini", price: 89000, stock: 5, code: "BB-NODE-M" },
          { name: "Express Terminal LTE", price: 34900, stock: 20, code: "EXP-LTE" }
        ];

        for (const p of seedProducts) {
          const productRef = doc(collection(db, 'products'));
          await setDoc(productRef, {
            ...p,
            businessId: businessId,
            createdAt: new Date().toISOString()
          });
        }
        console.log("Default catalog seeded.");
      }

      // Record profile record in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name,
        email: firebaseUser.email || "",
        role: role,
        status: status,
        businessId: businessId,
        telegramId: tgUser?.id || null,
        createdAt: new Date().toISOString()
      });
      console.log("User record created.");
      
      // The onSnapshot listener will trigger after setDoc is completed, 
      // which will then pick up user profile and transition the state machine to 'dashboard'!
    } catch (err: any) {
      console.error("Error creating onboarding records:", err);
      setAuthError(`Во время инициализации системы произошла ошибка: ${err.message}`);
      setOnboardingState('register');
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let isCancelled = false;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!isCancelled) {
           setUser(firebaseUser);
           setAuthError(null);
        }
        
        console.log("Firebase Auth changed: state is online. User UID:", firebaseUser.uid);
        let hasFiredSnapshot = false;
        
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), async (userDoc) => {
          if (isCancelled) return;
          hasFiredSnapshot = true;
          setAuthError(null);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<AppUser, 'uid'>;
            console.log("User Document matched:", userData);
            setAppUser({ uid: firebaseUser.uid, ...userData });
            
            // Fetch business info
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
                console.error("Error fetching business record:", err);
                if (!isCancelled) setBusiness(null);
              }
            } else {
              if (!isCancelled) setBusiness(null);
            }

            // State auto transition to dashboard if authenticated and profile is completely ready
            if (!isCancelled) {
              if (onboardingState === 'auth' || onboardingState === 'creating_system') {
                 setOnboardingState('dashboard');
              }
              setLoading(false);
            }
          } else {
             // User document does not exist yet. This is a newly compiled Firebase user who must register.
             console.log("Auth is loaded but profile document does not exist. Directing to register state.");
             if (!isCancelled) {
               setAppUser(null);
               setBusiness(null);
               if (onboardingState === 'auth') {
                  setOnboardingState('register');
               }
               setLoading(false);
             }
          }
        }, (error) => {
          console.error("Error snapshotting user profile:", error);
          if (!isCancelled) {
             setAppUser(null);
             setBusiness(null);
             setLoading(false);
          }
        });
      } else {
         console.log("Firebase Auth: user is logged out.");
         if (!isCancelled) {
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
      isCancelled = true;
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, [retryTrigger, onboardingState]);

  const logout = async () => {
    await auth.signOut();
    setOnboardingState('landing');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      appUser, 
      business, 
      loading, 
      authError, 
      logout, 
      retryAuth,
      onboardingState,
      setOnboardingState,
      startAuth,
      completeRegistration
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
