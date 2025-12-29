// Content Script: Injects necessary scripts into the page context
const scriptsToInject = [
  'jquery-3.3.1.min.js',
  'chatworkHelper.js'
];

function injectScript(file) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    script.onload = () => {
      script.remove(); // Remove script tag after loading to keep DOM clean
      resolve();
    };
    script.onerror = reject;
    (document.head || document.documentElement).appendChild(script);
  });
}

// Inject scripts sequentially to ensure dependencies (jQuery) are loaded first
(async function loadScripts() {
  for (const file of scriptsToInject) {
    await injectScript(file);
  }
})();
