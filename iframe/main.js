import React, {Component} from 'react';
import 'highlight.js/styles/solarized-dark.css';
import 'antd/dist/antd.css';
import {Switch, List, Button, Tabs} from 'antd';
import {CopyrightOutlined, DeleteOutlined, HeartOutlined} from '@ant-design/icons';

import Highlight from 'react-highlight-js'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const {TabPane} = Tabs;

import './Main.less';


export default class Main extends Component {
  constructor() {
    super();
    chrome.runtime.onMessage.addListener(({type, to, sql}) => {
      if (type === 'YEARNING_TICKLER' && to === 'iframe') {
        console.info('iframe/main.js:30', sql);
        this.handleClickAdd(sql);
        /*const {interceptedRequests} = this.state;
        if (!interceptedRequests[match]) interceptedRequests[match] = [];

        const exits = interceptedRequests[match].some(obj => {
          if (obj.url === url) {
            obj.num++;
            return true;
          }
          return false;
        });

        if (!exits) {
          interceptedRequests[match].push({url, num: 1});
        }
        this.setState({interceptedRequests}, () => {
          if (!exits) {
            // 新增的拦截的url，会多展示一行url，需要重新计算高度
            this.updateAddBtnTop_interval();
          }
        })*/
      }
    });

    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'YEARNING_TICKLER', to: 'background', iframeScriptLoaded: true});

    this.collapseWrapperHeight = -1;
  }

  state = {
    interceptedRequests: {},
    sqlList            : [],
    favouriteList      : [],
  }

  componentDidMount() {
    this.setState({
      sqlList      : window.setting.SQL_LIST,
      favouriteList: window.setting.FAVOURITE_LIST,
    });
  }


  updateAddBtnTop = () => {
    /*
    let curCollapseWrapperHeight = this.collapseWrapperRef ? this.collapseWrapperRef.offsetHeight : 0;
    if (this.collapseWrapperHeight !== curCollapseWrapperHeight) {
      this.collapseWrapperHeight = curCollapseWrapperHeight;
      clearTimeout(this.updateAddBtnTopDebounceTimeout);
      this.updateAddBtnTopDebounceTimeout = setTimeout(() => {
        this.addBtnRef.style.top = `${curCollapseWrapperHeight + 30}px`;
      }, 50);
    }
    */
  }

  // 计算按钮位置
  updateAddBtnTop_interval = ({timeout = 1000, interval = 50} = {}) => {
    const i = setInterval(this.updateAddBtnTop, interval);
    setTimeout(() => {
      clearInterval(i);
    }, timeout);
  }

  set = (key, value) => {
    // 发送给background.js
    chrome.runtime.sendMessage(chrome.runtime.id, {type: 'YEARNING_TICKLER', to: 'background', key, value});
    chrome.storage && chrome.storage.local.set({[key]: value});
  }

  forceUpdateDebouce = () => {
    clearTimeout(this.forceUpdateTimeout);
    this.forceUpdateTimeout = setTimeout(() => {
      this.forceUpdate();
    }, 1000);
  }

  handleClickAdd = (sql) => {
    console.info('iframe/main.js:119', window.setting.SQL_LIST)
    window.setting.SQL_LIST.unshift(sql);
    this.set('SQL_LIST', window.setting.SQL_LIST);

    this.setState({
      sqlList: window.setting.SQL_LIST,
    });
    this.forceUpdate();
    //const {interceptedRequests} = this.state;
    //this.setState({interceptedRequests}, this.updateAddBtnTop_interval);
  }

  handleAddFavourite = (e, sql) => {
    window.setting.FAVOURITE_LIST.unshift(sql);
    this.set('FAVOURITE_LIST', window.setting.FAVOURITE_LIST);

    this.setState({
      favouriteList: window.setting.FAVOURITE_LIST,
    });
    this.forceUpdate();
  }

  handleClickRemove = (e, i) => {
    e.stopPropagation();
    const {sqlList} = this.state;
    //const match                 = window.setting.SQL_LIST[i].match;

    const sqlList2 = [
      ...sqlList.slice(0, i),
      ...sqlList.slice(i + 1),
    ];
    this.setState({
      sqlList: sqlList2,
    });
    window.setting.SQL_LIST = sqlList2
    this.set('SQL_LIST', sqlList2);
    this.forceUpdate();

    // delete interceptedRequests[match];
    //this.setState({interceptedRequests}, this.updateAddBtnTop_interval);
  }

  handleRemoveFavourite = (e, i) => {
    e.stopPropagation();
    const {favouriteList} = this.state;

    const favouriteList2 = [
      ...favouriteList.slice(0, i),
      ...favouriteList.slice(i + 1),
    ];
    this.setState({
      favouriteList: favouriteList2,
    });
    window.setting.FAVOURITE_LIST = favouriteList2
    this.set('FAVOURITE_LIST', favouriteList2);
    this.forceUpdate();
  }

  handleCollaseChange = ({timeout = 1200, interval = 50}) => {
    this.updateAddBtnTop_interval();
  }

  handleSwitchChange = () => {
    window.setting.YEARNING_TICKLER_SWITCH_ON = !window.setting.YEARNING_TICKLER_SWITCH_ON;
    this.set('YEARNING_TICKLER_SWITCH_ON', window.setting.YEARNING_TICKLER_SWITCH_ON);

    this.forceUpdate();
  }

  render() {
    const {sqlList, favouriteList} = this.state;
    return (
      <div className="main">
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          style={{zIndex: 10}}
          defaultChecked={window.setting.YEARNING_TICKLER_SWITCH_ON}
          onChange={this.handleSwitchChange}
        />
        <div className='settingBody'>
          <Tabs defaultActiveKey="1">
            <TabPane tab="日志" key="1">
              {sqlList && sqlList.length > 0 ? (
                <List
                  header={<div>SQL LOG ({sqlList.length})</div>}
                  bordered
                  dataSource={sqlList}
                  itemLayout="vertical"
                  renderItem={(item, i) => (
                    <List.Item
                      style={{width: '100%', paddingLeft: '2px', paddingRight: '2px'}}
                      key={item.key}
                      actions={[
                        <a style={{fontSize: '12px'}}>{item.source}.{item.data_base}</a>,
                        <CopyToClipboard text={item.sql}>
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<CopyrightOutlined/>}
                            size="small"
                          />
                        </CopyToClipboard>,
                        <Button
                          style={{marginRight: '16px'}}
                          type="danger"
                          shape="circle"
                          icon={<HeartOutlined/>}
                          size="small"
                          onClick={e => this.handleAddFavourite(e, item)}
                        />,
                        <Button
                          style={{marginRight: '16px'}}
                          type="danger"
                          shape="circle"
                          icon={<DeleteOutlined/>}
                          size="small"
                          onClick={e => this.handleClickRemove(e, i)}
                        />,
                      ]}
                    >
                      <div><Highlight key={'hj' + item.key} className='language-sql'>{item.sql}</Highlight></div>
                    </List.Item>
                  )}
                />
              ) : <div/>}
            </TabPane>
            <TabPane tab="收藏" key="2">
              {favouriteList && favouriteList.length > 0 ? (
                <List
                  header={<div>FAVOURITE ({favouriteList.length})</div>}
                  bordered
                  dataSource={favouriteList}
                  itemLayout="vertical"
                  renderItem={(item, i) => (
                    <List.Item
                      style={{width: '100%', paddingLeft: '2px', paddingRight: '2px'}}
                      key={item.key}
                      actions={[
                        <a style={{fontSize: '12px'}}>{item.source}.{item.data_base}</a>,
                        <CopyToClipboard text={item.sql}>
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<CopyrightOutlined/>}
                            size="small"
                          />
                        </CopyToClipboard>,
                        <Button
                          style={{marginRight: '16px'}}
                          type="danger"
                          shape="circle"
                          icon={<DeleteOutlined/>}
                          size="small"
                          onClick={e => this.handleRemoveFavourite(e, i)}
                        />,
                      ]}
                    >
                      <div><Highlight key={'hj' + item.key} className='language-sql'>{item.sql}</Highlight></div>
                    </List.Item>
                  )}
                />
              ) : <div/>}
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}
