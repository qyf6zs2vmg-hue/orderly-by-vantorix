import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-me';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
    // Validate that the auth_date is recent (e.g., within 24 hours)
    const authDate = parseInt(userData.auth_date, 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return res.status(401).json({ error: 'Auth date is expired.' });
    }

    // 6. Signature is valid. Create a JWT token
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

    return res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } else {
    return res.status(403).json({ error: 'Data is NOT from Telegram (Hash mismatch).' });
  }
}
