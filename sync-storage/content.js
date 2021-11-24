// 监听来自 popup/background的消息
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
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
    if (request.type === 'close') {
      document.querySelector('.v-modal').style.display = 'none';
      let allDialog = document.getElementsByClassName('el-dialog__wrapper');
      [...allDialog].forEach((dialog) => {
        dialog.style.display = 'none';
      })
    }
  }
);