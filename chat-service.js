/**
 * ChatService类 - 处理聊天消息的数据结构和相关操作
 */
class ChatService {
  constructor() {
    // 存储消息的数组
    this.messages = [];
    // 本地存储的键名
    this.storageKey = 'chat_messages';
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 创建新消息
   * @param {string} role - 消息角色 (user/assistant)
   * @param {string} content - 消息内容
   * @param {Object} additionalProps - 额外的属性（可扩展）
   * @returns {Object} 消息对象
   */
  createMessage(role, content, additionalProps = {}) {
    const message = {
      id: this.generateId(),
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
      // 以下是可扩展的字段
      status: 'sent', // 消息状态：sending, sent, failed, received
      metadata: {},  // 可存储各种元数据
      ...additionalProps // 合并额外属性
    };
    return message;
  }

  /**
   * 添加消息到消息列表
   * @param {Object} message - 消息对象
   */
  addMessage(message) {
    this.messages.push(message);
    this.saveMessages();
    return message;
  }

  /**
   * 保存消息到本地存储
   * 值必须是字符串类型,所以需要使用JSON.stringify()方法将数组转换为字符串
   */
  saveMessages() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch (error) {
      console.error('保存消息失败:', error);
    }
  }

  /**
   * 从本地存储加载消息
   * @returns {Array} 消息数组
   */
  loadMessages() {
    try {
      const storedMessages = localStorage.getItem(this.storageKey);
      if (storedMessages) {
        this.messages = JSON.parse(storedMessages);
        return this.messages;
      }
    } catch (error) {
      console.error('加载消息失败:', error);
    }
    return [];
  }

  /**
   * 渲染消息到DOM
   * @param {HTMLElement} container - 消息容器元素
   * @param {Object} message - 消息对象
   */
  renderMessage(container, message) {
    const msgDiv = document.createElement('div');

    // 设置消息类名，role为user或assistant
    const roleClass = message.role === 'user' ? 'user' : 'assistant';
    msgDiv.classList.add('message', roleClass);

    // 设置消息内容
    msgDiv.innerText = message.content;

    // 添加到容器
    container.appendChild(msgDiv);

    // 滚动到底部
    container.scrollTop = container.scrollHeight;

    return msgDiv;
  }

  /**
   * 删除消息
   * @param {string} messageId - 消息ID
   * @returns {boolean} 是否删除成功
   */
  deleteMessage(messageId) {
    const initialLength = this.messages.length;
    this.messages = this.messages.filter(msg => msg.id !== messageId);

    if (this.messages.length !== initialLength) {
      this.saveMessages();
      return true;
    }
    return false;
  }

  /**
   * 更新消息
   * @param {string} messageId - 消息ID
   * @param {Object} updates - 要更新的字段
   * @returns {Object|null} 更新后的消息对象，更新失败返回null
   */
  updateMessage(messageId, updates) {
    const messageIndex = this.messages.findIndex(msg => msg.id === messageId);

    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        ...updates
      };
      this.saveMessages();
      return this.messages[messageIndex];
    }
    return null;
  }

  /**
   * 清空所有消息
   */
  clearMessages() {
    this.messages = [];
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('清空消息失败:', error);
    }
  }

  /**
   * 获取指定时间段的消息
   * @param {Date} startTime - 开始时间
   * @param {Date} endTime - 结束时间
   * @returns {Array} 消息数组
   */
  getMessagesByTimeRange(startTime, endTime) {
    return this.messages.filter(msg => {
      const msgTime = new Date(msg.timestamp);
      return msgTime >= startTime && msgTime <= endTime;
    });
  }
}