// 监听来自 popup/background的消息
console.log({localStorage})
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log({request, sender, sendResponse})
    if (request.type === "get"){
      sendResponse(localStorage);
    }
    if (request.type === "set") {
      // 获取并设置 缓存数据
      if (request.store) {
        Object.keys(request.store).forEach((key) => {
          localStorage[key] = request.store[key];
        })
        sendResponse();
      }
    }
  }
);