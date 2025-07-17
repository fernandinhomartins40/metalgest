const moduleAlias = require('module-alias');
const path = require('path');

// Registra os aliases para produção
moduleAlias.addAliases({
  '@': path.join(__dirname, '.'),
  '@/app': path.join(__dirname, 'app'),
  '@/config': path.join(__dirname, 'config'),
  '@/controllers': path.join(__dirname, 'controllers'),
  '@/middleware': path.join(__dirname, 'middleware'),
  '@/routes': path.join(__dirname, 'routes'),
  '@/services': path.join(__dirname, 'services'),
  '@/types': path.join(__dirname, 'types'),
  '@/utils': path.join(__dirname, 'utils')
});