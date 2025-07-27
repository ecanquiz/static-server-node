// testSetup.ts
import path from 'path'
import moduleAlias from 'module-alias'

// Specific configuration for tests
moduleAlias.addAliases({
  '@': path.join(__dirname, 'src'),
  '@config': path.join(__dirname, 'src/config'),
  '@controllers': path.join(__dirname, 'src/controllers'),
  '@middlewares': path.join(__dirname, 'src/middlewares'),
  '@routes': path.join(__dirname, 'src/routes'),
  '@utils': path.join(__dirname, 'src/utils'),
  '@public': path.join(__dirname, 'public')
})