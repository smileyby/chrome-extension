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
    let url = tabs[0].url;
    let pendingUrl = tabs[0].pendingUrl;
    if (url === '' && pendingUrl == "chrome://newtab/" && !isEnabled) {
      chrome.tabs.update(tabs[0].id, {url: 'chrome-search://local-ntp/local-ntp.html'});
    }
  });
});