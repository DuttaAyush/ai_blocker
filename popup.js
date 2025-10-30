// Load and display blocked sites
function loadSites() {
  chrome.runtime.sendMessage({ action: 'getBlockedSites' }, (response) => {
    const siteList = document.getElementById('siteList');
    const sites = response.blockedSites;
    
    if (sites.length === 0) {
      siteList.innerHTML = '<div class="empty">No sites blocked yet</div>';
    } else {
      siteList.innerHTML = sites.map(site => `
        <div class="site-item">
          <span>${site}</span>
          <button class="remove-btn" data-site="${site}">Remove</button>
        </div>
      `).join('');
      
      // Add event listeners to remove buttons
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const site = btn.getAttribute('data-site');
          chrome.runtime.sendMessage({ action: 'removeSite', site }, () => {
            loadSites();
          });
        });
      });
    }
  });
}

// Add site manually
document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('siteInput');
  let site = input.value.trim();
  
  if (site) {
    // Clean up the input (remove protocol, www, trailing slash)
    site = site.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    
    chrome.runtime.sendMessage({ action: 'addSite', site }, (response) => {
      if (response.success) {
        input.value = '';
        loadSites();
      } else {
        alert(response.error || 'Failed to add site');
      }
    });
  }
});

// Allow Enter key to add site
document.getElementById('siteInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('addBtn').click();
  }
});

// Load sites on popup open
loadSites();