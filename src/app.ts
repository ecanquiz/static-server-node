import './utils/aliasLoader';
import express from 'express';
import cors from 'cors';
import { host, port, apiAllowedOrigins } from '@config/index';
import apiRoutes from '@routes/apiRoutes'

const app = express();
const origins: string[] = JSON.parse(apiAllowedOrigins);

// Allow CORS for all origins (development only!)
/*app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});*/

app.use(cors({
  origin: origins,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(apiRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening on ${host}:${port}`);
    console.log(`Serving static files in ${host}:${port}/images`);
    console.log(`Serving storage in ${host}:${port}/storage`);
  });
}

export default app; 