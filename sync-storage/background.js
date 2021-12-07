let isEnabled;
chrome.storage.local.get(['enabled'], function(res){
  isEnabled = res.enabled;
});

chrome.storage.onChanged.addListener(function (changes){
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if(key == "enabled"){
      isEnabled = newValue;
    }
  }
});
chrome.tabs.onCreated.addListener(function(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
    // 此处需要注意，要想拿到 url 和 pendingUrl 的值
    // 必须在 manifest -> permissions 中添加 tabs 权限
    let url = tabs[0].url;
    let pendingUrl = tabs[0].pendingUrl;
    if (url === '' && pendingUrl == "chrome://newtab/" && !isEnabled) {
      chrome.tabs.update(tabs[0].id, {url: 'chrome-search://local-ntp/local-ntp.html'});
    }
  });
});