// Default Selectors
const DEFAULT_SELECTORS = '#rso .g, #rso .MjjYud, div[data-sokoban-container], div.g, li.b_algo, [data-appns="SERP"]';

document.addEventListener('DOMContentLoaded', async () => {
  // UI Elements
  const powerToggle = document.getElementById('power-toggle');
  const statusText = document.getElementById('status-text');
  const highlightCount = document.getElementById('highlight-count');
  const statusCard = document.getElementById('status-card');
  const colorBubbles = document.querySelectorAll('.color-bubble');
  const btnFlash = document.getElementById('btn-flash');
  const btnSettingsToggle = document.getElementById('btn-settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  const selectorInput = document.getElementById('selector-input');
  const btnSaveSelectors = document.getElementById('btn-save-selectors');
  const btnReset = document.getElementById('btn-reset');

  // State
  let activeTabId = null;

  // 1. Get current active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (activeTab) {
    activeTabId = activeTab.id;
  }

  // 2. Load settings from storage
  chrome.storage.local.get({
    enabled: true,
    highlightColor: 'blue',
    customSelector: DEFAULT_SELECTORS
  }, (items) => {
    // Set UI values based on storage
    powerToggle.checked = items.enabled;
    updateStatusUI(items.enabled);
    
    // Select color bubble
    colorBubbles.forEach(bubble => {
      if (bubble.dataset.color === items.highlightColor) {
        bubble.classList.add('active');
      } else {
        bubble.classList.remove('active');
      }
    });

    // Set selectors input
    selectorInput.value = items.customSelector;

    // Get live status from content script if on Google or Bing Search
    requestLiveStatus();
  });

  // 3. Listen for Power Toggle
  powerToggle.addEventListener('change', () => {
    const isEnabled = powerToggle.checked;
    updateStatusUI(isEnabled);
    
    chrome.storage.local.set({ enabled: isEnabled }, () => {
      notifyContentScript({ action: 'toggle', enabled: isEnabled });
    });
  });

  // 4. Listen for Color Bubble Clicks
  colorBubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      const color = bubble.dataset.color;
      
      // Update UI active class
      colorBubbles.forEach(b => b.classList.remove('active'));
      bubble.classList.add('active');

      chrome.storage.local.set({ highlightColor: color }, () => {
        notifyContentScript({ action: 'changeColor', color: color });
      });
    });
  });

  // 5. Toggle Advanced Settings Drawer
  btnSettingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('collapsed');
    btnSettingsToggle.classList.toggle('active');
  });

  // 6. Save Custom Selectors
  btnSaveSelectors.addEventListener('click', () => {
    const selectorValue = selectorInput.value.trim() || DEFAULT_SELECTORS;
    selectorInput.value = selectorValue;

    chrome.storage.local.set({ customSelector: selectorValue }, () => {
      notifyContentScript({ action: 'updateSelectors', selectors: selectorValue });
      // Visual feedback on save
      btnSaveSelectors.textContent = 'Saved & Applied!';
      btnSaveSelectors.style.background = 'var(--success-color)';
      setTimeout(() => {
        btnSaveSelectors.textContent = 'Apply Selector';
        btnSaveSelectors.style.background = 'var(--primary-color)';
      }, 1500);
    });
  });

  // 7. Reset Custom Selectors to Default
  btnReset.addEventListener('click', () => {
    selectorInput.value = DEFAULT_SELECTORS;
    chrome.storage.local.set({ customSelector: DEFAULT_SELECTORS }, () => {
      notifyContentScript({ action: 'updateSelectors', selectors: DEFAULT_SELECTORS });
    });
  });

  // 8. Verify Scan (Flash Results)
  btnFlash.addEventListener('click', () => {
    if (!powerToggle.checked) {
      // Visual wobble if disabled
      btnFlash.classList.add('wobble');
      setTimeout(() => btnFlash.classList.remove('wobble'), 500);
      return;
    }
    notifyContentScript({ action: 'flash' });
  });

  // Helper: Update Status Text and UI styling
  function updateStatusUI(isEnabled) {
    if (isEnabled) {
      statusText.textContent = 'Active';
      statusText.classList.add('active');
    } else {
      statusText.textContent = 'Disabled';
      statusText.classList.remove('active');
      highlightCount.textContent = '0';
    }
  }

  // Helper: Send message to active tab content script
  function notifyContentScript(message) {
    if (!activeTabId) return;
    chrome.tabs.sendMessage(activeTabId, message, () => {
      // Handle optional error if script is not loaded
      if (chrome.runtime.lastError) {
        // Suppress warning about receiving end not existing
      }
    });
  }

  // Helper: Request current highlights count from active tab content script
  function requestLiveStatus() {
    if (!activeTabId || !powerToggle.checked) {
      setNotOnSupportedSearch();
      return;
    }

    // Check if the tab URL matches Google or Bing search
    if (activeTab.url && isSupportedSearchUrl(activeTab.url)) {
      chrome.tabs.sendMessage(activeTabId, { action: 'getStatus' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          // If message fails, it means content script isn't loaded yet or tab is loading
          highlightCount.textContent = '...';
          return;
        }
        
        if (response.enabled) {
          highlightCount.textContent = response.count;
        } else {
          highlightCount.textContent = '0';
        }
      });
    } else {
      setNotOnSupportedSearch();
    }
  }

  // Helper: Set UI state to show extension is inactive on non-supported page
  function setNotOnSupportedSearch() {
    if (activeTab && (!activeTab.url || !isSupportedSearchUrl(activeTab.url))) {
      statusText.textContent = 'Inactive';
      statusText.classList.remove('active');
      statusText.style.color = 'var(--text-muted)';
      statusText.style.background = 'rgba(255, 255, 255, 0.05)';
      statusText.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      highlightCount.textContent = '-';
      btnFlash.style.opacity = '0.5';
      btnFlash.style.pointerEvents = 'none';
      btnFlash.title = 'Open a Google or Bing Search page to test';
    }
  }

  // Helper: Check if URL is Google or Bing Search
  function isSupportedSearchUrl(url) {
    try {
      const parsed = new URL(url);
      const isGoogle = parsed.hostname.includes('google.') && parsed.pathname.includes('/search');
      const isBing = parsed.hostname.includes('bing.com') && parsed.pathname.includes('/search');
      return isGoogle || isBing;
    } catch (e) {
      return false;
    }
  }
});
