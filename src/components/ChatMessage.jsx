import React, { useEffect, useRef } from 'react';

const ChatMessage = ({ message, onRetry }) => {
  const contentRef = useRef(null);
  
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

  // 处理Markdown渲染
  useEffect(() => {
    if (message.role === 'assistant' && contentRef.current && window.marked) {
      try {
        // 配置marked选项以确保更好的渲染效果
        window.marked.setOptions({
          breaks: true,  // 将换行符转换为<br>
          gfm: true,     // 启用GitHub风格的Markdown
          pedantic: false, // 不启用严格的Markdown规范
          silent: true    // 静默模式，不输出警告
        });
        
        // 使用marked.js解析Markdown内容
        contentRef.current.innerHTML = window.marked.parse(message.content);
      } catch (error) {
        console.error('Markdown解析错误:', error);
        contentRef.current.textContent = message.content;
      }
    }
  }, [message.content, message.role]);

  return (
    <div className={`message ${message.role} status-${message.status}`} data-id={message.id}>
      {message.role === 'assistant' ? (
        // AI回复使用Markdown渲染
        <div className="message-content markdown-content" ref={contentRef}>
          {/* Markdown内容将通过useEffect渲染 */}
        </div>
      ) : (
        // 用户消息保持原样显示
        <div className="message-content">{message.content}</div>
      )}
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