// 配置文件，存储应用配置
const config = {
  // API配置，从环境变量获取密钥
  api: {
    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    // 注意：在实际生产环境中，应该使用环境变量
    // 这里暂时保留，但应该通过后端服务获取
    key: '3977ed5a-ed0d-470f-b593-11f5d300255a',
    model: 'doubao-seed-1-6-251015'
  },
  // 本地存储键名
  storageKey: 'chat_messages'
};

// 使用全局变量导出配置，避免模块导出问题
window.appConfig = config;