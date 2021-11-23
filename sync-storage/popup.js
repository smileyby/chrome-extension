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
      this.data.ex = document.querySelector('.export');
      this.data.im = document.querySelector('.import');
      this.data.reset = document.querySelector('.reset');
      this.data.header = document.querySelector('.card-header');
      chrome.storage.local.get(['text', 'store'], function(res){
        _this.setResult(res.store ? res.text : undefined);
      })
      this.addEvent();
    },
    setResult(result = '暂无同步数据'){
      this.data.header.innerText = result;
    },
    addEvent(){
      let { ex, im, reset } = this.data;
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

