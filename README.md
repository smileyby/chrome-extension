> chrome 插件常用组成：

1. manifest.json：必须，包含插件的名称、版本号、图标、脚本文件名称等
2. background script：可调用全部的 chrome 插件api
3. 功能页面：包括点击插件图标的弹出页面（popup），插件的配置页面（options）
4. content script：插件注入到页面的脚本
5. brower_action：固定在chrome的工具栏
6. page_action：在地址栏的右端，可设置特定网页展示

> 想要在扩展 popup 页面访问到当前页面的信息，需要借助 content_script 向页面中注入脚本

> popup 每一次都是重新创建的，所以想要保存一些状态，可以用过 background 或 插件本身的缓存

> 梳理通信关系
1. 点击导出 => popup 通知 content 收集当前标签页 localStorage => 回传给 popup 版本在插件缓存中
2. 点击导入 => popup 收到通知 将插件缓存中的 store 提取出来 => 发消息通知 content 并携带 store 数据 => content 设置完毕，回调通知 popup
3. 点击重置 => popup 将本地缓存中的数据全部清除

// 新标签页设置
"chrome_url_overrides" : {
  "newtab": "myPage.html"
},

> 参考文档：https://developer.chrome.com/docs/extension