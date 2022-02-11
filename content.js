// 在页面上插入代码
const script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', chrome.extension.getURL('pageScripts/main.js'));
document.documentElement.appendChild(script);

script.addEventListener('load', () => {
  chrome.storage.local.get(['YEARNING_TICKLER_SWITCH_ON', 'SQL_LIST'], (result) => {
    if (result.hasOwnProperty('YEARNING_TICKLER_SWITCH_ON')) {
      postMessage({type: 'YEARNING_TICKLER', to: 'pageScript', key: 'YEARNING_TICKLER_SWITCH_ON', value: result.YEARNING_TICKLER_SWITCH_ON});
    }
    if (result.SQL_LIST) {
      postMessage({type: 'YEARNING_TICKLER', to: 'pageScript', key: 'SQL_LIST', value: result.SQL_LIST});
    }
  });
});


let iframe;
let iframeLoaded = false;

// 只在最顶层页面嵌入iframe
if (window.self === window.top) {

  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      iframe           = document.createElement('iframe');
      iframe.className = "yearning-tickler";
      iframe.style.setProperty('height', '100%', 'important');
      iframe.style.setProperty('width', '500px', 'important');
      iframe.style.setProperty('min-width', '1px', 'important');
      iframe.style.setProperty('position', 'fixed', 'important');
      iframe.style.setProperty('top', '0', 'important');
      iframe.style.setProperty('right', '0', 'important');
      iframe.style.setProperty('left', 'auto', 'important');
      iframe.style.setProperty('bottom', 'auto', 'important');
      iframe.style.setProperty('z-index', '9999999999999', 'important');
      iframe.style.setProperty('transform', 'translateX(520px)', 'important');
      iframe.style.setProperty('transition', 'all .4s', 'important');
      iframe.style.setProperty('box-shadow', '0 0 15px 2px rgba(0,0,0,0.12)', 'important');
      iframe.frameBorder = "none";
      iframe.src         = chrome.extension.getURL("iframe/index.html")
      document.body.appendChild(iframe);
      let show = false;

      chrome.runtime.onMessage.addListener((msg, sender) => {
        if (msg == 'toggle') {
          show = !show;
          iframe.style.setProperty('transform', show ? 'translateX(0)' : 'translateX(520px)', 'important');
        }

        return true;
      });
    }
  }
}


// 接收background.js传来的信息，转发给pageScript
chrome.runtime.onMessage.addListener(msg => {
  console.info('content.js:61', msg);
  if (msg.type === 'YEARNING_TICKLER' && msg.to === 'content') {
    if (msg.hasOwnProperty('iframeScriptLoaded')) {
      if (msg.iframeScriptLoaded) iframeLoaded = true;
    } else {
      postMessage({...msg, to: 'pageScript'});
    }
  }
});

// 接收pageScript传来的信息，转发给iframe
window.addEventListener("pageScript", function (event) {
  console.info("content.js:72", event.detail);
  if (iframeLoaded) {
    chrome.runtime.sendMessage({type: 'YEARNING_TICKLER', to: 'iframe', ...event.detail});
  } else {
    let count                  = 0;
    const checktLoadedInterval = setInterval(() => {
      if (iframeLoaded) {
        clearInterval(checktLoadedInterval);
        chrome.runtime.sendMessage({type: 'YEARNING_TICKLER', to: 'iframe', ...event.detail});
      }
      if (count++ > 500) {
        clearInterval(checktLoadedInterval);
      }
    }, 10);
  }
}, false);
