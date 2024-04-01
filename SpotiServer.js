const fs = require('fs');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const config = require('./config');

const spotifyApi = new SpotifyWebApi({
  clientId: config.app.clientId,
  clientSecret: config.app.clientSecret,
  redirectUri: config.app.redirectUri
});

const tokenFilePath = './spotify-token.json';
const gifFilePath = './album-cover.gif';

let currentTrackId = '';
let currentTrackInfo = "No Track Playing";

function refreshTokenIfNeeded(callback) {
  const { refreshToken } = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
  spotifyApi.setRefreshToken(refreshToken);

  spotifyApi.refreshAccessToken().then(
    function(data) {
      console.log('Access token has been successfully refreshed!');
      spotifyApi.setAccessToken(data.body['access_token']);

      fs.writeFileSync(tokenFilePath, JSON.stringify({
        accessToken: data.body['access_token'],
        refreshToken 
      }), 'utf8');

      if (callback) callback();
    },
    function(err) {
      console.log('Could not refresh access token!', err);
    }
  );
}

function fetchCurrentPlayingTrack() {
  spotifyApi.getMyCurrentPlayingTrack()
    .then(function(data) {
      if (data.body && data.body.item && data.body.item.id !== currentTrackId) {
        currentTrackId = data.body.item.id;
        currentTrackInfo = `${data.body.item.name} - ${data.body.item.artists.map(artist => artist.name).join(', ')}`;

        console.log('Title: ', data.body.item.name);
        console.log('Artist: ', data.body.item.artists.map(artist => artist.name).join(', '));
        console.log('Album cover: ', data.body.item.album.images[0].url);
        createGif(data.body.item.name, data.body.item.artists.map(artist => artist.name).join(', '), data.body.item.album.images[0].url);
      } else if (!data.body || !data.body.item) {
        console.log('No track is currently playing.');
        currentTrackInfo = "No Track Playing";
      }
    }, function(err) {
      console.error('Error fetching the current track:', err);
      currentTrackInfo = "No Track Playing";
      if (err.statusCode === 401) {
        refreshTokenIfNeeded(fetchCurrentPlayingTrack);
      }
    });
}

function createGif(title, artist, coverUrl) {
  const width = 64;
  const height = 64;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const encoder = new GIFEncoder(width, height);
  
  encoder.start();
  encoder.setRepeat(0);   
  encoder.setDelay(265);  
  encoder.setQuality(10); 

  loadImage(coverUrl).then(image => {
    const aspectRatio = image.width / image.height;
    const canvasAspectRatio = width / height;
    let renderWidth, renderHeight, offsetX, offsetY;

    if (aspectRatio > canvasAspectRatio) {
      renderHeight = height;
      renderWidth = image.width * (renderHeight / image.height);
      offsetX = (width - renderWidth) / 2;
      offsetY = 0;
    } else {
      renderWidth = width;
      renderHeight = image.height * (renderWidth / image.width);
      offsetX = 0;
      offsetY = (height - renderHeight) / 2;
    }

    const text = `${title} - ${artist}`;
    ctx.font = '8px Arial';
    const textWidth = ctx.measureText(text).width;
    let textOffset = width;
    const initialTextOffset = textOffset;

    const totalFrames = Math.ceil((initialTextOffset + textWidth) / 4);

    for (let i = 0; i < totalFrames; i++) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, height - 10, width, 10);
      ctx.fillStyle = '#fff';
      ctx.fillText(text, textOffset, height - 2);
      encoder.addFrame(ctx);

      textOffset -= 4;

      if (textOffset + textWidth < 0) {
        textOffset = width;
      }
    }

    encoder.finish();

    const buffer = encoder.out.getData();
    fs.writeFileSync(gifFilePath, buffer, 'binary');
    console.log('GIF successfully created!');
  });
}

function start() {
  const tokenData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
  if (tokenData.accessToken) {
    spotifyApi.setAccessToken(tokenData.accessToken);
  } else if (tokenData.refreshToken) {
    refreshTokenIfNeeded(fetchCurrentPlayingTrack);
  } else {
    console.log('No token available. Please authenticate.');
  }

  const app = express();

  app.get('/cover.gif', (req, res) => {
    res.sendFile(`${__dirname}/${gifFilePath}`, err => {
      if (err) {
        res.status(404).send('GIF not found. Make sure the script has generated the GIF.');
      }
    });
  });
  app.get('/check-song', (req, res) => {
    res.send(currentTrackInfo);
  });
  
  app.listen(config.app.SpotiPixelServerPort, () => {
    console.log(`Server started on http://localhost:${config.app.SpotiPixelServerPort}`);
  });

  setInterval(() => {
    fetchCurrentPlayingTrack();
  }, 1000);
}

start();
