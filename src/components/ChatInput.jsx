import React, { useState } from 'react';

const ChatInput = ({ onSend }) => {
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim()) {
      onSend(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-box">
      <textarea
        id="tx"
        placeholder="发送消息"
        rows="10"
        maxLength="1000"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className="iconfont icon-arrow-left-bold send-btn" onClick={handleSend}>
        发送
      </button>
    </div>
  );
};

export default ChatInput;