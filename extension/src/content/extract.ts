chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log("Extension laoded ? ")
  if (message.type === "EXTRACT_PAGE") {
    const text = document.body.innerText;
    console.log("Content script loaded");
    sendResponse({ text });
  }
});
