chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.color) {
    document.body.style.background = request.color;
    sendResponse({msg: '已生效'})
  }
})