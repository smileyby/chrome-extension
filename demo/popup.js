function getRandomColor(){
  let rgb = [];
  for(let i=0;i<3;i++){
    let color = Math.floor(Math.random()*256).toString(16);
    color = color.length == 1?'0'+color:color;
    rgb.push(color);
  }
  return '#' + rgb.join('');
}
const btn = document.getElementById('btn');
btn.addEventListener('click', () => {
  const color = getRandomColor();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {color}, (res) => {
        console.log('msg:',res.msg);
    })
  })
})

const noteListDom = document.getElementsByClassName('note-list')[0];
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
setNoteList();

const saveBtn = document.getElementById('save');
const textDom = document.getElementById('note-text');
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

const checkDom = document.getElementsByClassName('checkbox')[0];
chrome.storage.local.get(['enabled'], (res) => {
  checkDom.checked = res.enabled;
})
checkDom.addEventListener('change', function(){
  chrome.storage.local.set({enabled: checkDom.checked});
})
