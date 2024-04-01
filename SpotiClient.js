const axios = require('axios');
const config = require('./config');

const apiURL = config.app.PixooUrl;
const checkSongUrl = `${config.app.SpotiPixelServerUrl}/check-song`;
let previousSongName = "";
let lastRequestTime = 0;

async function fetchSongName() {
  try {
    const response = await axios.get(checkSongUrl, { timeout: 900 });
    return response.data;
  } catch (error) {
    console.error('Error fetching song name:', error);
    return null;
  }
}

async function fetchGif(url) {
  try {
    const response = await axios({ url, responseType: 'arraybuffer', timeout: 900 });
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
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 5000) {
    const waitTime = 5000 - timeSinceLastRequest;
    console.log(`Waiting to avoid overloading.`);
  } else {
  try {
    const response = await axios.post(apiURL, {
      Command: "Device/PlayTFGif",
      FileType: 2,
      FileName: gifUrl,
    }, { timeout: 900 });
    
    console.log(response.data);
    previousSongName = songName;
    lastRequestTime = Date.now();
  } catch (error) {
    console.error('Error sending request to Pixoo API:', error);
  }
}
}

function startGifCheckLoop() {
  setInterval(() => playNetGif(`${config.app.SpotiPixelServerUrl}/cover.gif`), 1500);
}

startGifCheckLoop();
