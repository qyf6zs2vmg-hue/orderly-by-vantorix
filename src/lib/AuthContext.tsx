import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface AppUser {
  uid: string;
  email: string;
  role: 'owner' | 'client';
  status: 'pending' | 'active' | 'blocked';
  businessId: string;
  name: string;
  accountId?: string;
  isAnonymous?: boolean;
  plan_type?: 'free' | 'pro';
  pro_expires_at?: any;
}

interface BusinessData {
  id: string;
  name: string;
  ownerId?: string;
  paymentSettings?: {
    enableBankCard: boolean;
    cardNumber: string;
    cardHolderName?: string;
  };
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
    let unsubscribeDoc: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        setUser(firebaseUser);
        
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), async (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<AppUser, 'uid'> & { accountId?: string };
            
            if (!userData.accountId) {
              const newAccountId = Math.floor(100000 + Math.random() * 900000).toString();
              await updateDoc(doc(db, 'users', firebaseUser.uid), { accountId: newAccountId });
              // Snapshot will trigger again, so we can just return or proceed
              userData.accountId = newAccountId;
            }

            if (!userData.plan_type) {
              userData.plan_type = 'free';
            }
            if (userData.plan_type === 'pro' && userData.pro_expires_at) {
              const now = new Date();
              const exp = userData.pro_expires_at.toDate ? userData.pro_expires_at.toDate() : new Date(userData.pro_expires_at);
              if (now > exp) {
                userData.plan_type = 'free';
                await updateDoc(doc(db, 'users', firebaseUser.uid), { plan_type: 'free' });
              }
            }

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
        setUser(null);
        setAppUser(null);
        setBusiness(null);
        setLoading(false);
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
