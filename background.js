chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.info('background.js:3', details.requestBody)
    if (details.method == "POST") {
      var postedString = decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(details.requestBody.raw[0].bytes)));
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        /*
       // 保存到后端 后续做成功能处理
        $.ajax({
          method: 'POST',
          url: "http://localhost/sql.php",
          data: {
            data: utf8to16(postedString)
          },
          success: function( result ) {
            console.info(result)
          }
        });
        */
        let data = JSON.parse(utf8to16(postedString))
        data.key = uuidv4();
        console.info(data)
        if (chrome.storage) {
          chrome.storage.local.get(['SQL_LIST', 'YEARNING_TICKLER_SWITCH_ON'], (result) => {
            if (result.hasOwnProperty('YEARNING_TICKLER_SWITCH_ON') && result.YEARNING_TICKLER_SWITCH_ON === true) {

              console.info('background.js:25', result)
              if (result.hasOwnProperty('SQL_LIST')) {
                console.info('background.js:27', result.SQL_LIST)
                console.info('background.js:28', data)
                result.SQL_LIST.unshift(data)
                console.info('background.js:29', result.SQL_LIST)
                chrome.storage.local.set({'SQL_LIST': result.SQL_LIST});
              } else {
                let SQL_LIST = [];
                SQL_LIST.unshift(data)
                chrome.storage.local.set({'SQL_LIST': SQL_LIST});
              }
              //chrome.runtime.sendMessage({type: 'YEARNING_TICKLER', to: 'iframe', sql: data});
              chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: 'YEARNING_TICKLER', to: 'iframe', sql: data});
              })
            } else {
              console.info('background.js:41', '不记录SQL')
            }
          });
        }
      })
    }
  },
  {urls: ["https://yearning.it.lixiangoa.com/api/v2/query/results"]},
  ["blocking", "requestBody"]
);

chrome.browserAction.onClicked.addListener(function (tab) {
  console.info('background.js:44', tab)
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, "toggle");
  })
});

// 接收iframe传来的信息，转发给content.js
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'YEARNING_TICKLER' && msg.to === 'background') {
    if (msg.key === 'YEARNING_TICKLER_SWITCH_ON') {
      if (msg.value === true) {
        chrome.browserAction.setIcon({
          path: {
            16 : '/images/16.png',
            32 : '/images/32.png',
            48 : '/images/48.png',
            128: '/images/128.png',
          }
        });
      } else {
        chrome.browserAction.setIcon({
          path: {
            16 : '/images/16_gray.png',
            32 : '/images/32_gray.png',
            48 : '/images/48_gray.png',
            128: '/images/128_gray.png',
          }
        });
      }
    }
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {...msg, to: 'content'});
    })
  }
});

chrome.storage.local.get(['YEARNING_TICKLER_SWITCH_ON'], (result) => {
  if (result.hasOwnProperty('YEARNING_TICKLER_SWITCH_ON')) {
    if (result.YEARNING_TICKLER_SWITCH_ON) {
      chrome.browserAction.setIcon({path: "/images/16.png"});
    } else {
      chrome.browserAction.setIcon({path: "/images/16_gray.png"});
    }
  }
});
