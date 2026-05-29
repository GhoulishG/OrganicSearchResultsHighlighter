# Organic Results Highlighter

A modern, lightweight Chrome extension designed to visually highlight organic search results on Google and Bing. By applying a soft, customizable pastel background, this extension helps you quickly separate organic content from ads, sponsored placements, and auxiliary search panels.

---

## Features

- **Google & Bing Support:** Fully compatible with regional Google and Bing domains.
- **Dynamic Pastel Themes:** Select from four curated color schemes (Pastel Blue, Purple, Green, and Pink) using an intuitive glassmorphism-styled popup interface.
- **Smart DOM Observation:** Powered by a debounced `MutationObserver` to ensure new search results are highlighted instantly as you scroll (supporting infinite scroll and AJAX loading) without impacting browser performance.
- **Noise Filtering:** Specifically designed to ignore non-organic elements (such as header cards, sidebars, empty results panels, and "People Also Ask" accordions in multiple languages) and nested sub-elements to prevent visual clutter.
- **Live Highlight Counter:** Displays the number of highlighted elements on the current page in real-time.
- **Verification Scan:** A quick-verify utility that flashes highlighted elements with a soft pulse so you can easily spot what's being styled.
- **Advanced Selector Configuration:** If search engines change their HTML structure, you can modify and apply CSS selectors on the fly directly from the advanced settings panel.
- **100% Privacy Friendly:** Runs entirely in your browser. It requests no network permissions, logs no data, and stores configurations locally via `chrome.storage.local`.

---

## File Structure

```
├── manifest.json         # Extension configuration, permissions, and matching rules
├── content.js            # Content script that detects and highlights search results
├── content.css           # Styling rules and animations for highlighted search cards
├── popup.html            # HTML structure for the extension popup UI
├── popup.js              # Script managing popup interaction and state storage
├── popup.css             # Glassmorphism styling and themes for the popup UI
├── icons/                # Extension icon assets (16px, 48px, 128px)
└── generate_icons.ps1    # PowerShell script to programmatically draw and generate icons
```

---

## How to Install and Run

Since this extension is in developer mode, you can load it directly into Google Chrome (or any Chromium-based browser like Brave, Edge, or Opera).

### Step 1: Clone or Download the Codebase
Download this repository to your local computer and extract it into a folder (e.g., `organic-results-highlighter`).

### Step 2: Open Chrome Extensions
1. Launch Google Chrome.
2. Navigate to `chrome://extensions/` by typing it into your address bar.
3. In the top-right corner, toggle the **Developer mode** switch to **ON**.

### Step 3: Load the Extension
1. Click the **Load unpacked** button in the top-left corner.
2. Select the folder containing the extension files (the directory containing `manifest.json`).

### Step 4: Test it Out
1. Open a new tab and go to [Google](https://www.google.com) or [Bing](https://www.bing.com).
2. Type any query to load a search results page.
3. Organic search results will instantly glow with a soft pastel highlight!
4. Click the extension icon in your toolbar to switch themes, verify scans, or adjust advanced settings.

---

## Customizing Selectors

If a search engine updates its markup and the extension stops highlighting results:
1. Open the extension popup.
2. Click the gear icon (**Advanced CSS Selectors**).
3. Add or modify the selectors (e.g. `#rso .g`) in the input box.
4. Click **Apply Selector** to save and apply the changes.
5. Click **Reset Default** at any time to restore the original working rules.

---

## Contributing & Forking

Contributions, feature requests, and bug reports are welcome! If you'd like to improve the extension:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch** for your changes:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Commit Your Changes** with clear descriptions:
   ```bash
   git commit -m "Add support for additional search engine"
   ```
4. **Push to Your Fork**:
   ```bash
   git push origin feature/amazing-new-feature
   ```
5. **Open a Pull Request** describing what you've done.

### Guidelines for Contributors:
- Keep styles modern and lightweight. Use standard CSS variables and CSS transition rules to preserve the premium glassmorphism visual layout.
- Ensure any modifications to `content.js` selector queries do not cause infinite loops inside the `MutationObserver`.
- Do not introduce external dependencies; keep the package vanilla and self-contained to maintain fast load times.

---

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as you see fit.
