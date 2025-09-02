import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import config from '@config/index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Static Server API',
    version: '1.0.0',
    description: 'API para servir archivos estáticos y procesar imágenes',
    contact: {
      name: 'API Support',
      email: 'support@example.com'
    }
  },
  servers: [
    {
      url: `${config.host}:${config.port}`,
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Ruta a tus archivos de rutas
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Static Server API Documentation'
  }));
  
  console.log(`📚 Swagger docs available at ${config.host}:${config.port}/api-docs`);
};
