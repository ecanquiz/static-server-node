import dotenv from 'dotenv'

dotenv.config();

if (!process.env.HOST) {
  throw new Error('Server misconfiguration: HOST is not configured.');
}

if (!process.env.PORT) { 
  throw new Error('Server misconfiguration: PORT is not configured.');
}

if (!process.env.API_ALLOWED_ORIGINS) { 
  throw new Error('Server misconfiguration: API_ALLOWED_ORIGINS is not configured');
}

if (!process.env.API_SHARED_TOKENS) { 
  throw new Error('Server misconfiguration: API_SHARED_TOKENS is not configured');
}

export const host = process.env.HOST;
export const port = process.env.PORT;
export const apiAllowedOrigins = process.env.API_ALLOWED_ORIGINS
export const apiSharedTokens = process.env.API_SHARED_TOKENS
export { mainScreen } from './characterStrings'
