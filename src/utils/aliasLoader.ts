import path from 'path';
import moduleAlias from 'module-alias';

// Dynamic configuration for development/production
const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? 'dist' : 'src';

moduleAlias.addAliases({
  '@': path.join(__dirname, basePath),
  '@config': path.join(__dirname, '../config'),
  '@controllers': path.join(__dirname, '../controllers'),
  '@middlewares': path.join(__dirname, '../middlewares'),
  '@routes': path.join(__dirname, '../routes'),
  '@utils': path.join(__dirname, '../utils'),
  '@public': path.join(__dirname, 'public')
});
