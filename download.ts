import https from 'https';
import fs from 'fs';

const id = '1GkYTrBuOloY2dv85KkPz1KJXYYuYx7XU';
const url = `https://drive.google.com/uc?export=download&id=${id}`;

https.get(url, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (res2) => {
      const file = fs.createWriteStream('public/hero.jpg');
      res2.pipe(file);
      file.on('finish', () => file.close());
    });
  } else {
    const file = fs.createWriteStream('public/hero.jpg');
    res.pipe(file);
    file.on('finish', () => file.close());
  }
});
