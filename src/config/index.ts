import dotenv from 'dotenv'

dotenv.config();

export const host = process.env.HOST || 'http://localhost';
export const port = process.env.PORT || 3000;
export const apiSharedTokens = process.env.API_SHARED_TOKENS
export const apiAllowedOrigins = process.env.API_ALLOWED_ORIGINS
