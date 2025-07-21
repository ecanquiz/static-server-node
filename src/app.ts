import { host, port } from './config';
import app from './server';

app.listen(port, () => {
  console.log(`Server listening on ${host}:${port}`);
  console.log(`Serving static files in ${host}:${port}/images`);
  console.log(`Serving storage in ${host}:${port}/storage`);
});
