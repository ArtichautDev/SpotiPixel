# SpotiPixel README

## Description

SpotiPixel leverages the Spotify API and Divoom's technology to convert music album covers into animated pixel art GIFs, specifically designed for display on Divoom's Pixoo devices. The project is ingeniously divided into two main components: a server-side module and a client-side application. The server-side is tasked with interfacing with Spotify's API to retrieve album covers, converting these images into GIFs suitable for pixel art representation, and hosting them on a web server for Divoom device accessibility. The client-side, on the other hand, fetches the GIF from the server and displays it on a Divoom device, creating a unique visual music experience.

While SpotiPixel currently supports the 64x64 resolution of Pixoo devices by default, contributions for compatibility with other resolutions are welcomed, aiming to extend support across Divoom's product range.

This split architecture not only facilitates users with ARM64 devices to bypass limitations related to GIF creation (due to lack of Canvas support on these platforms) but also offers flexibility in software deployment, allowing for broader device compatibility beyond Divoom's ecosystem.

## Installation Guide

1. **Clone the repository:** 
   ```bash
   git clone https://github.com/ArtichautDev/SpotiPixel.git
   ```
2. **Configure the application:** Rename `config.example.js` to `config.js`. Obtain your Spotify Client ID and Client Secret from [Spotify's Developer Dashboard](https://developer.spotify.com). Fill in these details in the configuration file, along with the IP address of your Divoom device (available through the Divoom app). If you plan to separate the server from the client, adjust the configuration accordingly.

3. **Install dependencies:** 
   ```bash
   npm install
   ```

4. **Initialize the application:** This step involves generating a Spotify token. Run the following command and follow the instructions on the displayed URL (ignore any errors during this step).
   ```bash
   node init.js
   ```
   You can verify the token's validity by re-running `node init.js`.

5. **Start SpotiPixel:** To launch the program, execute:
   ```bash
   node index.js
   ```

At this point, your Divoom device should be displaying Spotify album art as pixel art GIFs.

## Contributions

We welcome pull requests, especially those that would help extend support to more Divoom devices, enhancing SpotiPixel's versatility and user experience. Your contributions can help bring this innovative music visualizer to a wider audience.