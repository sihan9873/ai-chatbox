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
   * @param {string} status - 消息状态 (loading, sent, error, received)
   * @param {Object} additionalProps - 额外的属性（可扩展）
   * @returns {Object} 消息对象
   */
  createMessage(role, content, status = 'sent', additionalProps = {}) {
    const message = {
      id: this.generateId(),
      role: role,
      content: content,
      timestamp: new Date().toISOString(),
      // 消息状态：loading(加载中), sent(已发送), error(发送失败), received(已接收)
      status: status,
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
   * @returns {HTMLElement} 渲染的消息元素
   */
  renderMessage(container, message) {
    // 检查是否已存在该消息，如果存在则更新而不是创建新元素
    let msgDiv = container.querySelector(`.message[data-id="${message.id}"]`);
    
    if (!msgDiv) {
      // 创建新的消息元素
      msgDiv = document.createElement('div');
      msgDiv.dataset.id = message.id; // 添加data-id属性以便后续查找
      
      // 设置消息类名，role为user或assistant
      const roleClass = message.role === 'user' ? 'user' : 'assistant';
      msgDiv.classList.add('message', roleClass);
      
      // 添加到容器
      container.appendChild(msgDiv);
    } else {
      // 如果是更新现有消息，先移除所有状态类
      msgDiv.classList.remove('status-loading', 'status-sent', 'status-error', 'status-received');
    }
    
    // 添加当前状态的类名
    msgDiv.classList.add(`status-${message.status}`);
    
    // 构建消息内容HTML，包含状态指示器
    let statusIndicator = '';
    let statusText = '';
    
    switch (message.status) {
      case 'loading':
        statusIndicator = '<span class="status-indicator loading">⏳</span>';
        statusText = '发送中...';
        break;
      case 'sent':
        statusIndicator = '<span class="status-indicator sent">✓</span>';
        statusText = '已发送';
        break;
      case 'error':
        statusIndicator = '<span class="status-indicator error">✗</span>';
        statusText = '发送失败';
        break;
      case 'received':
        statusIndicator = '<span class="status-indicator received">✓✓</span>';
        statusText = '已接收';
        break;
      default:
        statusIndicator = '';
        statusText = '';
    }
    
    // 设置消息HTML内容
    msgDiv.innerHTML = `
      <div class="message-content">${this.escapeHTML(message.content)}</div>
      <div class="message-status">
        ${statusIndicator}
        <span class="status-text">${statusText}</span>
      </div>
    `;
    
    // 如果是错误状态，添加重试按钮
    if (message.status === 'error') {
      const retryButton = document.createElement('button');
      retryButton.className = 'retry-button';
      retryButton.innerText = '重试';
      retryButton.addEventListener('click', () => {
        this.updateMessageStatus(message.id, 'loading');
        // 这里可以触发消息重新发送的逻辑
        this.retryMessage(message.id);
      });
      msgDiv.appendChild(retryButton);
    }
    
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
      
      // 如果更新了状态，触发状态变化事件
      if (updates.status) {
        this.triggerEvent('messageStatusChanged', this.messages[messageIndex]);
      }
      
      return this.messages[messageIndex];
    }
    return null;
  }
  
  /**
   * 更新消息状态
   * @param {string} messageId - 消息ID
   * @param {string} status - 新状态
   * @returns {Object|null} 更新后的消息对象
   */
  updateMessageStatus(messageId, status) {
    return this.updateMessage(messageId, { status });
  }
  
  /**
   * 重试发送失败的消息
   * @param {string} messageId - 消息ID
   * @returns {Promise<Object>} 重试结果
   */
  retryMessage(messageId) {
    const message = this.messages.find(msg => msg.id === messageId);
    
    if (!message) {
      return Promise.reject(new Error('消息不存在'));
    }
    
    // 模拟异步发送过程
    return new Promise((resolve, reject) => {
      // 这里应该是实际的消息发送逻辑
      setTimeout(() => {
        // 模拟随机成功或失败
        const isSuccess = Math.random() > 0.3; // 70%成功率
        
        if (isSuccess) {
          this.updateMessageStatus(messageId, 'sent');
          resolve(message);
        } else {
          this.updateMessageStatus(messageId, 'error');
          reject(new Error('发送失败，请重试'));
        }
      }, 1500);
    });
  }
  
  /**
   * HTML转义，防止XSS攻击
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * 事件监听器存储
   */
  _events = {};
  
  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(eventName, callback) {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(callback);
  }
  
  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(eventName, callback) {
    if (this._events[eventName]) {
      this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    }
  }
  
  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  triggerEvent(eventName, data) {
    if (this._events[eventName]) {
      this._events[eventName].forEach(callback => callback(data));
    }
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
  
  /**
   * 根据状态获取消息
   * @param {string} status - 消息状态
   * @returns {Array} 符合条件的消息数组
   */
  getMessagesByStatus(status) {
    return this.messages.filter(msg => msg.status === status);
  }
  
  /**
   * 批量更新消息状态
   * @param {Array<string>} messageIds - 消息ID数组
   * @param {string} status - 新状态
   * @returns {Array<Object>} 更新后的消息对象数组
   */
  batchUpdateMessageStatus(messageIds, status) {
    return messageIds.map(id => this.updateMessageStatus(id, status));
  }
  
  /**
   * 检查消息是否发送中
   * @param {string} messageId - 消息ID
   * @returns {boolean} 是否发送中
   */
  isMessageLoading(messageId) {
    const message = this.messages.find(msg => msg.id === messageId);
    return message ? message.status === 'loading' : false;
  }
  
  /**
   * 取消正在发送的消息
   * @param {string} messageId - 消息ID
   * @returns {boolean} 是否取消成功
   */
  cancelMessage(messageId) {
    const message = this.updateMessageStatus(messageId, 'error');
    return !!message;
  }
}