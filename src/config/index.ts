import dotenv from 'dotenv';
dotenv.config();

const config = {
  get host(): string {
    try {
      const host = process.env.HOST ?? 'http://localhost';
      new URL(host); // Additional URL validation
      return host;
    } catch (e) {
      throw new Error('Invalid HOST format. Expected valid URL');
    }
  },

  get port(): number {
    try {
      return parseInt(process.env.PORT || '9000');
    } catch (e) {
      throw new Error('Invalid PORT format. Expected number');
    }
  },

  get apiAllowedOrigins(): string[] {
    try {
      const origins = JSON.parse(process.env.API_ALLOWED_ORIGINS || '[]');
      if (!Array.isArray(origins)) throw new Error();
      return origins;
    } catch (e) {
      throw new Error('Invalid API_ALLOWED_ORIGINS format. Expected JSON array');
    }
  },

  get apiSharedTokens(): Record<string, string> {
    try {
      const tokens = JSON.parse(process.env.API_SHARED_TOKENS || '{}');
      if (typeof tokens !== 'object' || tokens === null) throw new Error();
      return tokens;
    } catch (e) {
      throw new Error('Invalid API_SHARED_TOKENS format. Expected JSON object');
    }
  },

  mainScreen: `
    <h1>Static server with Node.js and Express</h1>
    <p>To access images, visit: <a href="/images">/images</a></p>
    <p>To access storage files, visit: <a href="/storage">/storage</a></p>
  `
};

// Presence validation (optional, getters now validate)
if (!process.env.HOST) console.warn('HOST not set, using default');
if (!process.env.PORT) console.warn('PORT not set, using default');
if (!process.env.API_ALLOWED_ORIGINS) throw new Error('API_ALLOWED_ORIGINS required');
if (!process.env.API_SHARED_TOKENS) throw new Error('API_SHARED_TOKENS required');

export default config;