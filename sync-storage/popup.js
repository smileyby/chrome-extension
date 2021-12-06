const popupFunc = (function(){
  return {
    data: {
      ex: '',
      im: '',
      reset: '',
      header: '',
      context: '',
    },
    init(){
      let _this = this;
      this.data.ex = this.getDom('.export');
      this.data.im = this.getDom('.import');
      this.data.reset = this.getDom('.reset');
      this.data.header = this.getDom('.card-header');
      this.data.close = this.getDom('.close');
      this.data.checkbox = this.getDom('.checkbox');
      chrome.storage.local.get(['text', 'store'], function(res){
        _this.setResult(res.store ? res.text : undefined);
      })
      this.addEvent();
    },
    getDom(name){
      return document.querySelector(name);
    },
    setResult(result = '暂无同步数据'){
      this.data.header.innerText = result;
    },
    addEvent(){
      let { ex, im, reset, close, checkbox } = this.data;
      let _this = this;
      ex.addEventListener('click', async () => {
        let currentTabId = await this.getCurrentTabId();
        chrome.tabs.sendMessage(currentTabId, { type: 'get' }, function(data){
          if (data) {
            let store = {};
            Object.keys(data).forEach((item) => {
              store[item] = data[item];
            })
            chrome.storage.local.set({store, text: 'storage已提取'}, function(){
              _this.setResult('storage已提取');
            });
          }
        })
      })
      
      im.addEventListener('click', async () => {
        let currentTabId = await this.getCurrentTabId();
        chrome.storage.local.get(['store'], function(res){
          chrome.tabs.sendMessage(currentTabId, { type: 'set', store: res.store }, function(res){
            _this.setResult('storage已设置');
          })
        });
        
      })
      
      reset.addEventListener('click', () => {
        chrome.storage.local.set({store: null, text: ''}, function(){
          _this.setResult();
        });
      })

      close.addEventListener('click', async () => {
        let currentTabId = await this.getCurrentTabId();
        chrome.tabs.sendMessage(currentTabId, { type: 'close' })
      })

      checkbox.addEventListener('change', function(e){
        console.log(this.checked);
      })
    },
    getCurrentTabId(){
      return new Promise((resolve) => {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function(tabs) {
          resolve(tabs[0].id)
        })
      })
    }
  }
})();
popupFunc.init();

