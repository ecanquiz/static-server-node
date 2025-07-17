// src/app.ts (punto de entrada)
import app from './server';

const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
  console.log(`Serving static files in ${HOST}:${PORT}/images`);
  console.log(`Serving storage in ${HOST}:${PORT}/storage`);
});