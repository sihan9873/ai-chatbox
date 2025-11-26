import React, { useEffect, useRef } from 'react';

const ChatMessage = ({ message, onRetry, onRegenerate }) => {
  const contentRef = useRef(null);
  const [copyStatus, setCopyStatus] = React.useState('');
  
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
  
  // 复制内容功能
  const handleCopy = async () => {
    try {
      // 复制原始文本内容
      await navigator.clipboard.writeText(message.content);
      setCopyStatus('已复制！');
      // 3秒后重置状态
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：创建临时文本区域
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyStatus('已复制！');
        setTimeout(() => setCopyStatus(''), 3000);
      } catch (fallbackErr) {
        console.error('降级复制也失败:', fallbackErr);
        setCopyStatus('复制失败');
        setTimeout(() => setCopyStatus(''), 3000);
      }
      document.body.removeChild(textArea);
    }
  };
  
  // 重新生成功能
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id);
    }
  };

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
      
      {/* AI消息的快捷操作按钮 */}
      {message.role === 'assistant' && (
        <div className="message-actions">
          <button 
            className="action-button copy-button"
            onClick={handleCopy}
            title="复制内容"
          >
            {copyStatus || '复制'}
          </button>
          <button 
            className="action-button regenerate-button"
            onClick={handleRegenerate}
            title="重新生成回复"
          >
            重新生成
          </button>
        </div>
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