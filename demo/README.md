> 以 工具栏 插件为例，需要实现的功能如下
>
> 1. 功能1：改变页面背景色
> 2. 功能2：记个笔记
> 3. 功能3：重写 newtab 页面，可设置是否展示
> 4. 功能4：发送ajax请求

### 前置内容（仅介绍需要使用内容）

1. 插件配置相关

   ```javascript
   {
     "manifest_version": 2,          // 插件版本：必须，最新版是v3
     "name": "demo",                 // 插件名称：必须
     "description": "description",   // 插件用途描述：非必须
     "version": "1.0.0",             // 插件版本号：必须
     "icons": {                      // 插件在 chrome://extensions/ 页展示的图标
       "48": "logo.png"
     },
     "browser_action": {             // 配置一个工具栏插件，点击图标以弹窗形式出现
       "default_icon": "logo.png",   // browser_action 在工具栏展示的图标
       "default_popup": "popup.html" // browser_action 对应的html页面
     },
     "background": {                 // 插件-常驻后台脚本配置
       "scripts": ["background.js"],
       "persistent": false
     },
     "content_scripts": [            // 插件-注入到页面中脚本配置
       {
         "matches": ["<all_urls>"],  // 指定 匹配 页面注入
         "js": ["content.js"]        // 需要注入的js脚本，可以是多个
       }
     ],
     "chrome_url_overrides" : {      // 插件-覆盖chrome默认配置
       "newtab": "new-tab.html"      // 指定 新标签页 为 new-tab.html 页面
     },
     "permissions": [                // 插件的权限配置
       "storage", "tabs"            
     ]
   }
   ```

2. 插件内部通信机制

   * `popup => content_script` | `background => content_script`

    ```javascript
     // 发送方，需要指定当前 tab.id
     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
         chrome.tabs.sendMessage(tabs[0].id, {msg: 'hello'}, (res) => {
             console.log('msg:',res.msg);
         })
     })
     ```
     
    ```javascript
     // 接收方
     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
       if (request.msg === 'hello') {
           sendResponse({msg: 'hi'});
       }
     })
     ```
     
   * `content_script => popup` | `backgroud => popup`  | `content_script => background` 

     ```javascript
     // 发送方
     chrome.runtime.sendMessage({msg: 'hello'}, function(res) {
         console.log('msg', res.msg);
     });
     ```

     ```javascript
     // 接收方
     chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
         if (request.msg === "hello")
           sendResponse({msg: "hi"});
       }
     );
     ```

   * popup => background

     ```javascript
     // popup.js
     // 获取 backgound 上下文，后通过 bgContext 调用方法和获取变量
     const bgContext = chrome.extension.getBackgroundPage();
     const data = bgContext.getData();
     ```

     ```javascript
     // background.js
     const getData = () => {
         return { data: 'data' }
     }
     ```

3. 插件storage操作

   * get

     ```javascript
     chrome.storage.local.get(['key'], function(res){
       console.log(res[key]);
     });
     ```

   * set

     ```javascript
     chrome.storage.local.set({key: value});
     ```


### 开始开发

> 在 chrome 中加载插件

1. 打开 chrome://extensions/ ，打开右侧开发者模式

2. 创建一个名为demo的文件夹，在demo中创建如下文件

   ```javascript
   ├── manifest.json
   ├── background.js
   ├── content.js
   ├── popup.html
   ├── popup.js
   ├── new-tab.html
   ├── background.js
   ├── img
   │   └── logo.png
   ```

3. 选择左侧导航条：加载已解压的扩展程序，选择demo文件夹加载

> 实现改变页面颜色

1. 原理：popup内绑定按钮点击事件 => 通知 content 改变页面颜色，content执行改变页面颜色操作

2. 实现代码如下：

   ```html
   <!-- popup.html -->
   <button id="btn">变色</button>
   ```

   ```javascript
   // popup.js
   // 随机颜色函数
   function getRandomColor(){
     let rgb = [];
     for(let i=0;i<3;i++){
       let color = Math.floor(Math.random()*256).toString(16);
       color = color.length == 1?'0'+color:color;
       rgb.push(color);
     }
     return '#' + rgb.join('');
   }
   // 绑定点击事件
   const btn = document.getElementById('btn');
   btn.addEventListener('click', () => {
     const color = getRandomColor();
     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
       chrome.tabs.sendMessage(tabs[0].id, {color}, (res) => {
           console.log('msg:',res.msg);
       })
     })
   })
   ```

   ```javascript
   // content.js
   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
     if (request.color) {
       document.body.style.background = request.color;
       sendResponse({msg: '已生效'})
     }
   })
   ```

> 实现记个笔记

1. 原理：将popup中的记录内容存储在storage中，保存和删除都更新 storage中的数据

2. 实现代码如下：

   ```html
   <!-- popup.html -->
   <ul>
       <li>
           <button id="save">保存笔记</button>
           <textarea id="note-text" cols="30" rows="10"></textarea>
       </li>
   </ul>
   <ul class="note-list"></ul>
   ```

   ```javascript
   // popup.js
   // 主要是对 插件 storage 的读写操作
   const saveBtn = document.getElementById('save');
   const textDom = document.getElementById('note-text');
   const noteListDom = document.getElementsByClassName('note-list')[0];
   
   // 渲染笔记列表
   function setNoteList(){
     let innerHTML = '';
     chrome.storage.local.get(['list'], function(res){
       const noteList = res.list;
       if (Array.isArray(noteList)) {
         noteList.forEach(({createTm, text}, index) => {
           innerHTML += `<li><span>${createTm}：${text}</span><span class="del" index="${index}">X</span></li>`;
         })
         noteListDom.innerHTML = innerHTML;
       }
     });
   }
   
   // 打开，主动渲染一次笔记列表
   setNoteList();
   
   // 保存笔记
   saveBtn.addEventListener('click', () => {
     const noteContent = textDom.value;
     if (noteContent) {
       chrome.storage.local.get(['list'], function(res){
         let noteList = res.list;
         const createTm = new Date().toLocaleString();
         if (Array.isArray(noteList)) {
           noteList.push({ createTm, text: noteContent });
         } else {
           noteList = [{ createTm, text: noteContent }];
         }
         chrome.storage.local.set({list: noteList}, function(){
           textDom.value = '';
           setNoteList();
         });
       });
     }
   })
   
   // 点击删除单条
   noteListDom.addEventListener('click', function(e){
     if (e.target.className === 'del') {
       const delIndex = e.target.getAttribute('index');
       chrome.storage.local.get(['list'], function(res){
         let noteList = res.list;
         noteList.splice(delIndex, 1);
         chrome.storage.local.set({list: noteList}, function(){
           setNoteList();
         });
       });
     }
   })
   ```

> 实现：重写 newtab 页面，可设置是否打开自定义标签页

1. 原理：配置好 chrome_url_overrides 后，在background.js中监听 tabs.onCreated 根据  标识 判断 是否打开自定义标签页

2. 具体代码如下：

   ```html
   <!-- popup.html -->
   <a href="chrome-extension://插件id/new-tab.html" target="_blank">New Tab</a>
   设为标签页 <input type="checkbox" class="checkbox">
   ```

   ```javascript
   // popup.js
   const checkDom = document.getElementsByClassName('checkbox')[0];
   chrome.storage.local.get(['enabled'], (res) => {
     checkDom.checked = res.enabled;
   })
   checkDom.addEventListener('change', function(){
     chrome.storage.local.set({enabled: checkDom.checked});
   })
   ```

   ```javascript
   // background.js
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
         // chrome-search://local-ntp/local-ntp.html 是 chrome 默认标签页地址  
         chrome.tabs.update(tabs[0].id, {url: 'chrome-search://local-ntp/local-ntp.html'});
       }
     });
   });
   ```

> 实现：发送ajax请求

1. 由于同源策略，需要在 permissions 中配置 请求域名 `http://*/` |`https://*/`

2. 具体代码：

   ```javascript
   // content background popup 均可发送请求
   const xhr = new XMLHttpRequest();
   xhr.open('GET', 'https://www.baidu.com/', true);
   xhr.onreadystatechange = function(){
     if (xhr.readyState === 4) {
       console.log(xhr.responseText)
     }
   }
   xhr.send();
   ```

> 总结：

1. 以上内容，并未引入框架并不是不可以；html/css/js均可引入外部文件
2. 每次更新代码，都需要在插件页面点击刷新按钮
3. 希望以上内容可以帮助你了解 chrome 插件的 开发过程
4. 标签页设置和记个笔记功能是借鉴掘金插件的

> 遇到的问题
>
> 1. [Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist. when using message passing API](https://stackoverflow.com/questions/55438276/unchecked-runtime-lasterror-could-not-establish-connection-receiving-end-does)
> 2. 