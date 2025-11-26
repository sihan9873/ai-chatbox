import React from 'react';

const ChatMessage = ({ message, onRetry }) => {
  // 获取状态指示器
  const getStatusIndicator = () => {
    switch (message.status) {
      case 'loading': return '⏳';
      case 'sent': return '✓';
      case 'error': return '✗';
      case 'received': return '✓✓';
      default: return '';
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (message.status) {
      case 'loading': return '发送中...';
      case 'sent': return '已发送';
      case 'error': return '发送失败';
      case 'received': return '已接收';
      default: return '';
    }
  };

  return (
    <div className={`message ${message.role} status-${message.status}`} data-id={message.id}>
      <div className="message-content">{message.content}</div>
      <div className="message-status">
        <span className={`status-indicator ${message.status}`}>
          {getStatusIndicator()}
        </span>
        <span className="status-text">{getStatusText()}</span>
      </div>
      {message.status === 'error' && (
        <button className="retry-button" onClick={() => onRetry(message.id)}>
          重试
        </button>
      )}
    </div>
  );
};

export default ChatMessage;