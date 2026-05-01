import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AppUser {
  uid: string;
  email: string;
  role: 'owner' | 'client';
  status: 'pending' | 'active' | 'blocked';
  businessId: string;
  name: string;
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
    let unsubscribeDoc: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
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
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
