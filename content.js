// State variables
let extensionEnabled = true;
let activeColor = 'blue';
let activeSelectors = '#rso .g, #rso .MjjYud, div[data-sokoban-container], div.g, li.b_algo, [data-appns="SERP"]';
let highlightedElements = new Set();
let observer = null;

// Initialize settings and run highlighter
function init() {
  chrome.storage.local.get({
    enabled: true,
    highlightColor: 'blue',
    customSelector: '#rso .g, #rso .MjjYud, div[data-sokoban-container], div.g, li.b_algo, [data-appns="SERP"]'
  }, (items) => {
    extensionEnabled = items.enabled;
    activeColor = items.highlightColor;
    activeSelectors = items.customSelector;

    // Apply initial highlighting if enabled
    applyHighlighting();

    // Start observing DOM changes (for infinite scroll / dynamic loading)
    setupObserver();
  });
}

// Function to find and highlight results
function applyHighlighting() {
  // First, clear existing highlights if disabled or updating selectors
  clearHighlights();

  if (!extensionEnabled) return;

  const results = findOrganicResults();
  
  results.forEach(el => {
    el.classList.add('organic-result-highlight', `theme-${activeColor}`);
    highlightedElements.add(el);
  });
}

// Locate organic results robustly, preventing nesting and filtering out non-organic modules like PAA
function findOrganicResults() {
  const selectors = activeSelectors.split(',').map(s => s.trim()).filter(Boolean);
  let candidates = [];

  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Validation check: must have a title (h3 or h2) and a link (a) to be organic search result
        // This filters out auxiliary elements, headers, sidebars, and empty panels
        const hasTitle = el.querySelector('h3') !== null || el.querySelector('h2') !== null;
        const hasLink = el.querySelector('a') !== null;
        
        if (hasTitle && hasLink && !candidates.includes(el) && !isPeopleAlsoAsk(el)) {
          candidates.push(el);
        }
      });
    } catch (e) {
      console.error('[G-Highlighter] Selector error:', selector, e);
    }
  });

  // Filter out any candidate that is nested inside another candidate
  // e.g. if .MjjYud wraps a .g, only highlight the outer one to avoid double borders
  return candidates.filter(el => {
    return !candidates.some(otherEl => otherEl !== el && otherEl.contains(el));
  });
}

// Detect and exclude the "People Also Ask" (PAA) container
function isPeopleAlsoAsk(el) {
  // 1. Structural check (known Google classes/attributes for PAA questions)
  if (
    el.querySelector('.related-question-pair') ||
    el.querySelector('g-accordion-container') ||
    el.querySelector('[jsname="yRDY8c"]') ||
    el.querySelector('[jsname="dnP05d"]')
  ) {
    return true;
  }

  // 2. Heading text check (looks for "People also ask" in various localized forms)
  const paaPatterns = [
    /people\s+also\s+ask/i,
    /autres\s+questions\s+posées/i,
    /nutzer\s+fragen\s+auch/i,
    /preguntas\s+relacionadas/i,
    /domande\s+correlate/i,
    /as\s+pessoas\s+também\s+perguntam/i,
    /他の人はこちらも質問しています/i,
    /其他用户还问了以下问题/i,
    /其他用戶還問了以下問題/i,
    /大家還在搜尋/i,
    /다른\s+사용자가\s+자주\s+묻는\s+질문/i,
    /veelgestelde\s+vragen/i,
    /похожие\s+запросы/i,
    /вопросы\s+по\s+теме/i
  ];

  // Check both h2 tags and generic role="heading" tags inside this block
  const headings = el.querySelectorAll('h2, [role="heading"]');
  for (const h of headings) {
    const text = h.textContent.trim().toLowerCase();
    if (paaPatterns.some(pattern => pattern.test(text))) {
      return true;
    }
  }

  return false;
}

// Clear all injected highlight classes
function clearHighlights() {
  highlightedElements.forEach(el => {
    if (el) {
      el.classList.remove(
        'organic-result-highlight',
        'theme-blue',
        'theme-purple',
        'theme-green',
        'theme-pink',
        'flash-active'
      );
    }
  });
  highlightedElements.clear();
}

// Setup MutationObserver with debouncing
function setupObserver() {
  if (observer) {
    observer.disconnect();
  }

  let debounceTimer;
  observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (extensionEnabled) {
        applyHighlighting();
      }
    }, 150); // Debounce to keep search smooth
  });

  // Observe the body or search results area
  const targetNode = document.getElementById('rcnt') || document.body;
  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    extensionEnabled = message.enabled;
    if (extensionEnabled) {
      applyHighlighting();
    } else {
      clearHighlights();
    }
    sendResponse({ success: true });
  } 
  
  else if (message.action === 'changeColor') {
    const oldColor = activeColor;
    activeColor = message.color;
    
    // Dynamically replace theme class on existing elements without full scan
    highlightedElements.forEach(el => {
      el.classList.remove(`theme-${oldColor}`);
      el.classList.add(`theme-${activeColor}`);
    });
    sendResponse({ success: true });
  } 
  
  else if (message.action === 'updateSelectors') {
    activeSelectors = message.selectors;
    applyHighlighting();
    sendResponse({ success: true });
  } 
  
  else if (message.action === 'getStatus') {
    // Return counts and state to popup
    sendResponse({
      count: highlightedElements.size,
      enabled: extensionEnabled,
      color: activeColor
    });
  } 
  
  else if (message.action === 'flash') {
    // Add flash animation class to all current highlights
    highlightedElements.forEach(el => {
      el.classList.remove('flash-active');
      // Trigger reflow to restart animation
      void el.offsetWidth;
      el.classList.add('flash-active');
    });

    // Remove flash class after animation completes (0.7s * 2 = 1.4s)
    setTimeout(() => {
      highlightedElements.forEach(el => {
        el.classList.remove('flash-active');
      });
    }, 1500);

    sendResponse({ success: true });
  }
  
  return true; // Keeps message channel open for async response
});

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
