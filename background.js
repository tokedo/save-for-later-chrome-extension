// background.js
// Author: Anatoly Zaytsev
// Version: 1.0
// Description: Background script for the Save For Later Chrome extension.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveTabs') {
    const timestamp = new Date().getTime();
    const data = {
      urls: request.urls,
      name: `Saved Tabs (${new Date(timestamp).toLocaleString()}) - ${request.urls.length} tab(s)`
    };
    // Save the tabs data to storage with the current timestamp as the key
    chrome.storage.sync.set({ [timestamp]: data }, () => {
      // Remove the active tab after saving the data
      chrome.tabs.query({ currentWindow: true, active: true }, ([tab]) => {
        chrome.tabs.remove(tab.id);
      });
      // Send a response back to the popup script after saving the tabs
      sendResponse({ success: true });
    });
    // Indicate that the response will be sent asynchronously
    return true;
  }
});
