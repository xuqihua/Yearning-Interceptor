import React from 'react';
import ReactDOM from 'react-dom';

import Main from './Main';

const DEFAULT_SETTING = {
  YEARNING_TICKLER_SWITCH_ON: true,
  SQL_LIST: [],
  FAVOURITE_LIST: [],
}

if (chrome.storage) {
  chrome.storage.local.get(['YEARNING_TICKLER_SWITCH_ON','SQL_LIST', 'FAVOURITE_LIST'], (result) => {
    window.setting = {
      ...DEFAULT_SETTING,
      ...result,
    };

    ReactDOM.render(
      <Main />,
      document.getElementById('main')
    );
  });
} else {
  window.setting = DEFAULT_SETTING;
  // 测试环境
  ReactDOM.render(
    <Main />,
    document.getElementById('main')
  );
}
