// Create a context menu for text selection
chrome.contextMenus.create({
  id: "readTextAloud",
  title: "Read Text Aloud",
  contexts: ["selection"]
});

// Add a click event listener for the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readTextAloud") {
    // Use chrome.scripting.executeScript in Manifest V3
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: speakSelection
    });
  }
});

// The function to be injected and executed in the context of the web page
function speakSelection() {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    const utterance = new SpeechSynthesisUtterance(selectedText);
    speechSynthesis.speak(utterance);
  }
}
