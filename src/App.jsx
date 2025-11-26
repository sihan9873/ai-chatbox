import React from 'react';
import ChatPage from './pages/ChatPage';
import './assets/css/base.css';
import './assets/css/msg.css';
import './assets/iconfont/iconfont.css';

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="right">
          <div className="new"></div>
        </div>
        <ul>
          <li>
            <a className="login">登录</a>
          </li>
          <li>
            <a className="doownload">下载</a>
          </li>
        </ul>
      </nav>
      <ChatPage />
    </div>
  );
}

export default App;