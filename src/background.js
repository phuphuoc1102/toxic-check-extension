chrome.runtime.onInstalled.addListener(() => {
  console.log('Service worker installed');
});

chrome.runtime.onMessage.addListener((message) => {
  console.log('[Background] Log from Content Script:', message.message);

  if (message.action === 'OPEN_AUTH_TAB') {
    chrome.tabs.create({
      url: message.url,
      active: true,
    });
  }
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.local.get('isToxicFilterOn', (data) => {
      if (data.isToxicFilterOn) {
        chrome.scripting.insertCSS({
          target: { tabId },
          css: `* {
            color: transparent !important;
            text-shadow: 0 0 5px rgba(0, 0, 0, 0.5) !important;
          }`,
        });
      }
    });
  }
});
