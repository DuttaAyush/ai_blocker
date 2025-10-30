# AI Website Blocker Chrome Extension

Automatically detects and blocks AI websites using Google Gemini API.

## Features
- Auto-detects AI websites using AI
- Blocks with black redirect page
- Manual add/remove sites via popup
- Saves blocked sites in Chrome storage

## Setup

1. **Get API Key**
   - Visit https://aistudio.google.com/apikey
   - Create free Gemini API key

2. **Install Extension**
   - Download/clone this repo
   - Open `background.js`
   - Replace `YOUR_API_KEY_HERE` with your API key
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select extension folder

3. **Done!** Visit any website - AI sites get blocked automatically.

## Files
- `manifest.json` - Extension config
- `background.js` - Blocking logic + API calls
- `blocked.html` - Black blocking page
- `popup.html/js` - UI to manage sites

## Usage
- Click extension icon to view/manage blocked sites
- Manually add sites by entering domain name
- Remove sites with "Remove" button