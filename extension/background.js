chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  try { await chrome.scripting.executeScript({target:{tabId:tab.id},files:['effects.js']}); }
  catch (error) { console.warn('Just for Fun : cette page ne permet pas l’injection.',error.message); }
});
