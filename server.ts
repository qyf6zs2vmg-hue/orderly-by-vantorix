import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;

app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-me';

// Telegram Bot Verification Endpoint
app.post('/api/auth/telegram', (req, res) => {
  const data = req.body;
  if (!data || !data.hash) {
    return res.status(400).json({ error: 'Missing Telegram authorization data.' });
  }

  // 1. Separate the hash from the rest of the auth data
  const { hash, ...userData } = data;

  // 2. Sort the keys alphabetically
  const dataCheckString = Object.keys(userData)
    .sort()
    .map((key) => `${key}=${userData[key]}`)
    .join('\n');

  // 3. Create the secret key using SHA256 of the bot token
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();

  // 4. Calculate HMAC-SHA-256 of the data string using the secret key
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // 5. Compare the calculated hash with the provided hash
  if (hmac === hash) {
    // Important: Validate that the authentication is recent (e.g., within 24 hours)
    const authDate = parseInt(userData.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return res.status(401).json({ error: 'Auth date is expired.' });
    }

    // 6. Signature is valid. Create a JWT token for the user session
    const token = jwt.sign(
      {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        photo_url: userData.photo_url,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: userData,
    });
  } else {
    return res.status(403).json({ error: 'Data is NOT from Telegram.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
