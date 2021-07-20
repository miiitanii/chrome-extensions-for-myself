// elements
let popup = document.querySelector('.p-popup');
let popupList = document.querySelector('.p-popup__list');

// input
let urlInput = document.querySelector('.js-url');
// POSTURLがストレージにある場合取得
chrome.storage.local.get(["postUrl"], (result) => {
  if(result.postUrl){
    urlInput.value = result.postUrl
  }
});

// btn
let plusBtn = document.querySelector('.js-plus');
let postBtn = document.querySelector('.js-post');

let addForm = (name = "", value = "") => {
  const _form = document.createElement("li");
  _form.classList.add("p-popup__item");
  _form.innerHTML = `
    <div class="p-popup__head">
      <input type="text" class="js-name" value="${name}">
    </div>
    <div class="p-popup__body">
      <input type="text" class="js-value" value="${value}">
    </div>
    <div class="p-popup__close">
      <button class="p-popup__close-btn js-close">x</button>
    </div>
  `
  _form.querySelector('.p-popup__close-btn').addEventListener("click", function() {
    this.closest(".p-popup__item").remove();
  });
  popupList.appendChild(_form);
}

function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = chrome.tabs.query(queryOptions);
  return tab;
}

async function initForm() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  addForm("title", tab.title);
  addForm("url", tab.url);
}

initForm();

plusBtn.addEventListener("click", () => {
  addForm();
});

postBtn.addEventListener("click", () => {
  // POSTURLを保存
  let postUrl = urlInput.value;
  chrome.storage.local.set({ "postUrl": postUrl });
  // POST処理
  popup.dataset.state = "post";

  postBtn.innerHTML = "POST中……";

  var xhr = new XMLHttpRequest();
  xhr.open("POST", postUrl, true);
  xhr.onreadystatechange = function() {
    // リクエスト終了時
    if(xhr.readyState === XMLHttpRequest.DONE) {
      var _status = xhr.status;
      postBtn.innerHTML = `HTTP STATUS：${_status}`;
      popup.dataset.state = "result"
      if (_status >= 200 && _status < 400) {
        // 正常終了
        if(_status == 200) {
          popup.dataset.status = "success";
        } else {
          popup.dataset.status = "caution";
        }
      } else {
        // エラー
        popup.dataset.status = "error";
      }
    }
    setTimeout(function(){
      popup.dataset.state = "";
      popup.dataset.status = "";
      postBtn.innerHTML = "POST";
    },1500);
  };
  xhr.send();
});