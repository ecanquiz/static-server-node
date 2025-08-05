import './utils/aliasLoader';
import express from 'express';
import cors from 'cors';
import apiRoutes from '@routes/apiRoutes'
import config from '@config/index';

const app = express();

app.use(cors({
  origin: config.apiAllowedOrigins,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept'
  ]
}));

app.use(apiRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`Server listening on ${config.host}:${config.port}`);
    console.log(`Serving static files in ${config.host}:${config.port}/images`);
    console.log(`Serving storage in ${config.host}:${config.port}/storage`);
  });
}

export default app; 