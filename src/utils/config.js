// 配置文件，存储应用配置
const config = {
  // API配置
  api: {
    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    key: '3977ed5a-ed0d-470f-b593-11f5d300255a',
    model: 'doubao-seed-1-6-251015'
  },
  // 本地存储键名
  storageKey: 'chat_messages'
};

// 使用ES模块标准导出
export default config;