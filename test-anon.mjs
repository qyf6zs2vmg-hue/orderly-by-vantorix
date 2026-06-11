import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import config from './firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(config);
const auth = getAuth(app);
signInAnonymously(auth).then(() => {
  console.log('SUCCESS');
  process.exit(0);
}).catch(err => {
  console.error('ERROR:', err.code, err.message);
  process.exit(1);
});
