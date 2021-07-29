// elements
let popup = document.querySelector('.p-popup');
let popupList = document.querySelector('.p-popup__list');

// input
let methodSelect = document.querySelector('.js-method');
let urlInput = document.querySelector('.js-url');
// URLがストレージにある場合取得
chrome.storage.local.get(["method", "url"], (_result) => {
  if(_result["method"]){
    methodSelect.options[_result["method"]].selected = true;
  }
  if(_result["url"]){
    urlInput.value = _result["url"]
  }
});

// btn
let plusBtn = document.querySelector('.js-plus');
let postBtn = document.querySelector('.js-post');

// フォームを追加
let addForm = (name = "", value = "") => {
  const _form = document.createElement("li");
  _form.classList.add("p-popup__item");
  _form.innerHTML = `
    <div class="p-popup__head">
      <input type="text" class="js-key" value="${name}">
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

// 現在のタブの情報を取得
function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = chrome.tabs.query(queryOptions);
  return tab;
}

// フォームの初期設定
async function initForm() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  addForm("title", tab.title);
  addForm("url", tab.url);
}

initForm();

function setPopupState(_state){
  popup.dataset.state = _state;
}
function setPopupStatus(_status){
  popup.dataset.status = _status;
}

plusBtn.addEventListener("click", () => {
  addForm();
});

postBtn.addEventListener("click", () => {
  // メソッドを保存
  let _method = methodSelect.value;
  chrome.storage.local.set({ "method": _method });

  // URLを保存
  let _url = urlInput.value;
  chrome.storage.local.set({ "url": _url });

  // 送信データを整理
  let _data = {};
  let _getParams = "?";
  let _key = document.querySelectorAll('.js-key');
  let _value = document.querySelectorAll('.js-value');

  for(let _i=0;_i<_key.length;_i++) {
    _data[_key[_i].value] = _value[_i].value;
    if(_i!=0){
      _getParams += "&";
    }
    _getParams += _key[_i].value + "=" + _value[_i].value;
  }

  // POST処理
  setPopupState("post");
  postBtn.innerHTML = "通信中……";

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    // リクエスト終了時
    if(xhr.readyState === XMLHttpRequest.DONE) {
      var _status = xhr.status;
      postBtn.innerHTML = `HTTP STATUS：${_status}`;
      setPopupState("result");
      if (_status >= 200 && _status < 400) {
        // 正常終了
        if(_status == 200) {
          setPopupStatus("success");
        } else {
          setPopupStatus("caution");
        }
      } else {
        // エラー
        setPopupStatus("error");
      }
    }
    setTimeout(function(){
      // 状態をリセット
      setPopupState("");
      setPopupStatus("");
      postBtn.innerHTML = "POST";
    },1500);
  };
  if(_method == 1){
    xhr.open("POST", _url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(_data));
  } else {
    xhr.open("GET", _url + _getParams, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
  }
});