const config = require('./config');

if (config.app.SpotiPixelClientMode === true) {
  require('./SpotiClient');
}

if (config.app.SpotiPixelServerMode === true) {
  require('./SpotiServer');
}
