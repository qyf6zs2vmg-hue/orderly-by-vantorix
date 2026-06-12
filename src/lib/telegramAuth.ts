import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function authenticateWithTelegram(tgUser: any, role: 'owner' | 'client', extraData: any = {}) {
    // ---- 1. Verify Telegram Auth Data via Backend API ----
    const verifyRes = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tgUser)
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Telegram authorization failed on backend.');
    }
    
    // Store JWT token locally
    localStorage.setItem('telegram_jwt', verifyData.token);
    
    // ---- 2. Initialize Firebase Session based on verified Telegram Data ----
    const email = `tg_${tgUser.id}@telegram.mock`;
    const password = `TgPass_${tgUser.id}_secure99`;

    try {
        // Attempt to sign in
        const cred = await signInWithEmailAndPassword(auth, email, password);
        
        // Update user fields on login to keep username and names fresh
        const userRef = doc(db, 'users', cred.user.uid);
        await setDoc(userRef, {
            telegramId: String(tgUser.id),
            telegramUsername: tgUser.username || '',
            firstName: tgUser.first_name || '',
            lastName: tgUser.last_name || '',
        }, { merge: true });

        return cred.user;
    } catch (err: any) {
        // If not found, create new user
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
           const cred = await createUserWithEmailAndPassword(auth, email, password);
           const uid = cred.user.uid;
           const batch = writeBatch(db);
           
           const userRef = doc(db, 'users', uid);
           
           let businessId = extraData.businessId || '';
           
           // Auto-create business if is owner
           if (role === 'owner' && !businessId) {
               const newBusinessRef = doc(collection(db, 'businesses'));
               businessId = newBusinessRef.id;
               batch.set(newBusinessRef, {
                   name: (tgUser.first_name || 'My') + ' Company',
                   ownerId: uid,
                   accessMode: 'private',
                   createdAt: Date.now()
               });
           }
           
           const newUser = {
               name: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
               email: email,
               role: role,
               status: 'active',
               uid: uid,
               businessId: businessId,
               telegramId: String(tgUser.id),
               telegramUsername: tgUser.username || '',
               firstName: tgUser.first_name || '',
               lastName: tgUser.last_name || '',
               plan_type: 'free',
               createdAt: Date.now(),
               ...extraData
           };
           
           batch.set(userRef, newUser);
           await batch.commit();
           
           return cred.user;
        }
        throw err;
    }
}
