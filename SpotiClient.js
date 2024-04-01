const axios = require('axios');
const crypto = require('crypto');
const config = require('./config');

const apiURL = config.app.PixooUrl;
const checkSongUrl = `${config.app.SpotiPixelServerUrl}/check-song`;
let previousSongName = "";

async function fetchSongName() {
  try {
    const response = await axios.get(checkSongUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching song name:', error);
    return null;
  }
}

async function fetchGif(url) {
  try {
    const response = await axios({ url, responseType: 'arraybuffer' });
    const gifBuffer = response.data;
    return { gifBuffer };
  } catch (error) {
    console.error('Error downloading GIF:', error);
    return null;
  }
}

async function playNetGif(gifUrl) {
  const songName = await fetchSongName();
  if (songName === previousSongName) {
    console.log('The song has not changed or an error has occurred. No need to check the GIF.');
    return;
  }
  const gifData = await fetchGif(gifUrl);
  if (!gifData) return;
  
  try {
    const response = await axios.post(apiURL, {
      Command: "Device/PlayTFGif",
      FileType: 2,
      FileName: gifUrl,
    });
    
    console.log(response.data);
    previousSongName = songName;
  } catch (error) {
    console.error('Error sending request to Pixoo API:', error);
  }
}

function startGifCheckLoop() {
  setInterval(() => playNetGif(`${config.app.SpotiPixelServerUrl}/cover.gif`), 1500);
}

startGifCheckLoop();
