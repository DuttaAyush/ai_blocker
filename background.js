// Your Gemini API key (get free from https://makersuite.google.com/app/apikey)
// Import config
importScripts('config.js');
const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

// Cache to avoid repeated API calls
const checkedSites = {};

// Listen for tab updates
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame
  
  const url = new URL(details.url);
  const hostname = url.hostname;
  
  // Skip chrome:// and extension pages
  if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') return;
  
  // Check if site is in blocked list
  chrome.storage.local.get(['blockedSites'], async (result) => {
    const blockedSites = result.blockedSites || [];
    
    if (blockedSites.includes(hostname)) {
      // Block the site
      blockSite(details.tabId);
    } else if (!checkedSites[hostname]) {
      // Check with AI if not already checked
      checkedSites[hostname] = true;
      const isAI = await checkWithAI(details.url);
      
      if (isAI) {
        // Add to blocked list
        blockedSites.push(hostname);
        chrome.storage.local.set({ blockedSites });
        blockSite(details.tabId);
      }
    }
  });
});

// Block site by redirecting to black page
function blockSite(tabId) {
  const blockedPageUrl = chrome.runtime.getURL('blocked.html');
  chrome.tabs.update(tabId, { url: blockedPageUrl });
}

// Check with AI if site is an AI tool
async function checkWithAI(url) {
  try {
    const prompt = `Is the website at the URL "${url}" a Generative AI website, tool, or service? Answer strictly with "YES" or "NO"`;
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 10
        },
        systemInstruction: {
          parts: [{
            text: "You are an AI detection bot. Your only job is to determine if a website is a Generative AI tool. You must only respond with 'YES' or 'NO'. Do not provide any explanation or other text."
          }]
        }
      })
    });
    
    const data = await response.json();
    const answer = data.candidates[0].content.parts[0].text.trim().toUpperCase();
    
    console.log(`AI check for ${url}: ${answer}`);
    return answer === 'YES';
  } catch (error) {
    console.error('Error checking with AI:', error);
    return false;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBlockedSites') {
    chrome.storage.local.get(['blockedSites'], (result) => {
      sendResponse({ blockedSites: result.blockedSites || [] });
    });
    return true;
  } else if (request.action === 'removeSite') {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      const updated = blockedSites.filter(site => site !== request.site);
      chrome.storage.local.set({ blockedSites: updated }, () => {
        delete checkedSites[request.site]; // Remove from cache
        sendResponse({ success: true });
      });
    });
    return true;
  } else if (request.action === 'addSite') {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      if (!blockedSites.includes(request.site)) {
        blockedSites.push(request.site);
        chrome.storage.local.set({ blockedSites }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'Site already blocked' });
      }
    });
    return true;
  }
});