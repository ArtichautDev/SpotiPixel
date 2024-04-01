const express = require('express');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs');
const config = require('./config');

const SpotifyStrategy = require('passport-spotify').Strategy;

const app = express();

app.use(session({
  secret: 'SHSHHZJZKZKXIZKskziskISKQ',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

const tokenFilePath = './spotify-token.json';


passport.use(new SpotifyStrategy({
  clientID: config.app.clientId,
  clientSecret: config.app.clientSecret,
  callbackURL: config.app.redirectUri
},
function(accessToken, refreshToken, expires_in, profile, done) {
fs.writeFileSync(tokenFilePath, JSON.stringify({ accessToken, refreshToken }), 'utf8');

  done(null, profile);
}));

app.use(passport.initialize());

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-playback-state', 'user-read-currently-playing'], showDialog: true }));

app.get('/callback', passport.authenticate('spotify', { failureRedirect: '/login' }), function(req, res) {
  res.send('Authentication successful! You can close this window.');
});

function checkTokenAndStart() {
  if (fs.existsSync(tokenFilePath)) {
    const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
    if (tokenData.accessToken) {
      console.log('Token found, you can use the Spotify API.');
    } else {
      startAuthServer();
    }
  } else {
    startAuthServer();
  }
}

function startAuthServer() {
  app.listen(config.app.InitPort, () => console.log(`Server started on http://localhost:${config.app.InitPort}/auth/spotify. Please authenticate.`));
}

checkTokenAndStart();
