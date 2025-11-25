// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
  const tx = document.getElementById('tx');
  const chatContent = document.querySelector('.chat-content');

  // 初始化聊天服务
  const chatService = new ChatService();

  // 从本地存储加载历史消息
  const historyMessages = chatService.loadMessages();
  // 渲染历史消息
  historyMessages.forEach(message => {
    chatService.renderMessage(chatContent, message);
  });

  // 创建可复用的发送消息函数
  function sendMessage() {
    const messageText = tx.value.trim();

    if (messageText) {
      // 创建用户消息对象
      const userMessage = chatService.createMessage('user', messageText);

      // 保存并渲染用户消息
      chatService.addMessage(userMessage);
      chatService.renderMessage(chatContent, userMessage);

      // 更新用户消息状态为加载中
      chatService.updateMessageStatus(userMessage.id, 'loading');
      chatService.renderMessage(chatContent, userMessage);

      // 调用大模型API获取回复
      chatService.sendMessageToAPI(messageText)
        .then(response => {
          // 更新用户消息状态为已发送
          chatService.updateMessageStatus(userMessage.id, 'sent');
          chatService.renderMessage(chatContent, userMessage);

          // 创建AI回复消息
          const aiMessage = chatService.createMessage('assistant', response);
          chatService.addMessage(aiMessage);
          chatService.renderMessage(chatContent, aiMessage);
        })
        .catch(error => {
          // 更新用户消息状态为错误
          chatService.updateMessageStatus(userMessage.id, 'error');
          chatService.renderMessage(chatContent, userMessage);
          console.error('获取AI回复失败:', error);
        });

      // 滚动到底部
      chatContent.scrollTop = chatContent.scrollHeight;
    }

    // 清空文本域
    tx.value = '';
  }

  // 监听文本域的按键事件，实现按下回车发送消息
  tx.addEventListener('keyup', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { // 按下Enter但不按Shift时发送
      e.preventDefault(); // 阻止默认换行行为
      sendMessage(); // 调用可复用的发送消息函数
    }
  });

  // 为发送按钮添加点击事件
  const sendBtn = document.querySelector('.send-btn');
  sendBtn.addEventListener('click', sendMessage); // 调用相同的发送消息函数
});
