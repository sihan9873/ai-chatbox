import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';
import ChatService from '../services/ChatService';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [chatService] = useState(() => new ChatService());
  const chatContentRef = useRef(null);

  // 初始化时加载历史消息
  useEffect(() => {
    const historyMessages = chatService.loadMessages();
    setMessages([...historyMessages]);

    // 添加事件监听器
    const handleMessageStatusChange = (updatedMessage) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
      );
    };

    chatService.on('messageStatusChanged', handleMessageStatusChange);

    return () => {
      chatService.off('messageStatusChanged', handleMessageStatusChange);
    };
  }, []);

  // 滚动到底部
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  // 发送消息
  const handleSendMessage = (content) => {
    // 创建用户消息
    const userMessage = chatService.createMessage('user', content);
    chatService.addMessage(userMessage);
    setMessages(prev => [...prev, userMessage]);

    // 更新状态为加载中
    chatService.updateMessageStatus(userMessage.id, 'loading');
    setMessages(prev => prev.map(msg => msg.id === userMessage.id ? { ...msg, status: 'loading' } : msg));

    // 发送到API
    chatService.sendMessageToAPI(content)
      .then(response => {
        // 更新用户消息状态为已发送
        chatService.updateMessageStatus(userMessage.id, 'sent');
        setMessages(prev => prev.map(msg => msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg));

        // 创建AI回复消息
        const aiMessage = chatService.createMessage('assistant', response);
        chatService.addMessage(aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      })
      .catch(error => {
        // 更新用户消息状态为错误
        chatService.updateMessageStatus(userMessage.id, 'error');
        setMessages(prev => prev.map(msg => msg.id === userMessage.id ? { ...msg, status: 'error' } : msg));
        console.error('获取AI回复失败:', error);
      });
  };

  // 重试失败的消息
  const handleRetryMessage = (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    // 更新状态为加载中
    chatService.updateMessageStatus(messageId, 'loading');
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, status: 'loading' } : msg));

    // 重新发送
    chatService.sendMessageToAPI(message.content)
      .then(response => {
        // 更新消息状态为已发送
        chatService.updateMessageStatus(messageId, 'sent');
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, status: 'sent' } : msg));

        // 创建AI回复消息
        const aiMessage = chatService.createMessage('assistant', response);
        chatService.addMessage(aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      })
      .catch(() => {
        // 更新消息状态为错误
        chatService.updateMessageStatus(messageId, 'error');
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, status: 'error' } : msg));
      });
  };

  // 重新生成AI回复
  const handleRegenerateMessage = (aiMessageId) => {
    // 找到AI消息在数组中的位置
    const aiMessageIndex = messages.findIndex(msg => msg.id === aiMessageId);
    if (aiMessageIndex === -1 || messages[aiMessageIndex].role !== 'assistant') return;

    // 找到对应的用户消息（通常是AI消息前一条）
    const userMessage = messages[aiMessageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    // 创建一个临时的加载中消息来替换原有AI消息
    const loadingMessage = {
      ...messages[aiMessageIndex],
      content: '正在生成新的回复...',
      status: 'loading'
    };

    // 更新UI，显示加载状态
    const updatedMessages = [...messages];
    updatedMessages[aiMessageIndex] = loadingMessage;
    setMessages(updatedMessages);

    // 发送请求获取新的回复
    chatService.sendMessageToAPI(userMessage.content)
      .then(response => {
        // 创建新的AI回复消息
        const newAiMessage = chatService.createMessage('assistant', response);
        newAiMessage.id = aiMessageId; // 保持相同的ID以便替换
        
        // 更新消息列表，替换原有AI消息
        const finalMessages = [...messages];
        finalMessages[aiMessageIndex] = newAiMessage;
        setMessages(finalMessages);
        
        // 更新本地存储
        chatService.updateMessage(newAiMessage);
      })
      .catch(error => {
        console.error('重新生成回复失败:', error);
        // 恢复原有消息状态
        const errorMessage = {
          ...messages[aiMessageIndex],
          status: 'error'
        };
        const errorMessages = [...messages];
        errorMessages[aiMessageIndex] = errorMessage;
        setMessages(errorMessages);
      });
  };

  return (
    <div className="main">
      <Sidebar />
      <div className="chat-box">
        <div className="chat-content" ref={chatContentRef}>
          {messages.map(message => (
            <ChatMessage 
              key={message.id} 
              message={message}
              onRetry={handleRetryMessage}
              onRegenerate={handleRegenerateMessage}
            />
          ))}
        </div>
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;