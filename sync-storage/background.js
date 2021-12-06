// let store = null;
// let result = '';

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message === 'get-store-data') {
//     sendResponse(store);
//   }
// });

// 在chrome中监听 新标签页打开事件，然后判断打开的链接是否是 newtab 
// 如果是，在判断自己的勾选配置是否已经打开，打开则跳转自己指定的页面上，如果没打开则跳newtab
// chrome.tabs.onCreated.addListener(function callback(){
//   chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
//     let url = tabs[0].url;
//     let pendingUrl = tabs[0].pendingUrl;
//     if(url == "" && pendingUrl == "chrome://newtab/" && isEnabled){
//         if(!value.includes("http://") && !value.includes("https://") && value.includes(".") && !value.includes("file") && !value.includes("C:/") && !value.includes("D:/")){
//           value = "http://" + value;
//         }
//         chrome.tabs.update(tabs[0].id, {url: value});
//     }
//   });
// });