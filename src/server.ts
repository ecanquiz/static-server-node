import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 9000;

const staticDir = path.join(__dirname, '../public/images');

app.use('/images', express.static(staticDir));

app.use('/images', (req, res) => {
  res.status(404).send('Sorry, the image you are looking for does not exist..');
});

app.get('/', (req, res) => {
  res.send('Simple static server with Node and Express.\n Access images in /images');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Serving static files in http://localhost:${PORT}/images`);
});

