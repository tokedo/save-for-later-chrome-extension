// popup.js
// Author: Anatoly Zaytsev
// Version: 1.0
// Description: Script for the Save For Later Chrome extension's popup.

// Save tabs and close window when "Save For Later" button is clicked
document.getElementById('saveForLater').addEventListener('click', async () => {
  const currentWindow = await chrome.windows.getCurrent({ populate: true });
  const urls = currentWindow.tabs.map(tab => tab.url);

  // Send a message to the background script and wait for a response before closing the window
  chrome.runtime.sendMessage({ action: 'saveTabs', urls }, () => {
    // Close the active window after saving the tabs and receiving a response
    chrome.windows.remove(currentWindow.id);

    // Update the display after closing the active window
    renderSavedTabs();
  });
});

// Render the saved tabs list
function renderSavedTabs() {
  const savedTabsContainer = document.getElementById('savedTabsContainer');

  chrome.storage.sync.get(null, (items) => {
    savedTabsContainer.innerHTML = ''; // Clear the container before rendering

    for (const key in items) {
      const linkWrapper = document.createElement('div');
      linkWrapper.className = 'link-wrapper';

      const linkButtonContainer = document.createElement('div');
      linkButtonContainer.className = 'link-button-container';

      const link = document.createElement('a');
      link.href = '#';
      const numberOfTabs = items[key].urls.length;
      link.textContent = items[key].name || `Saved Tabs (${new Date(parseInt(key)).toLocaleString()}) - ${numberOfTabs} tab(s)`;
      link.addEventListener('click', () => {
        const urls = items[key].urls;
        urls.forEach(url => chrome.tabs.create({ url }));
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'x';
      deleteButton.addEventListener('click', () => {
        chrome.storage.sync.remove(key);
        linkWrapper.remove();
      });

      // Add the "edit" button
      const editButton = document.createElement('button');
      editButton.textContent = 'edit';
      editButton.addEventListener('click', () => {
        const newName = prompt('Enter a new name for the link:', link.textContent);
        if (newName !== null && newName !== '') {
          const updatedData = { ...items[key], name: newName };
          chrome.storage.sync.set({ [key]: updatedData }, () => {
            link.textContent = newName;
          });
        }
      });

      linkButtonContainer.appendChild(link);
      linkButtonContainer.appendChild(deleteButton);
      linkButtonContainer.appendChild(editButton); // Add the "edit" button to the container
      linkWrapper.appendChild(linkButtonContainer);
      savedTabsContainer.appendChild(linkWrapper);
    }
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    renderSavedTabs();
  }
});

renderSavedTabs();
