    // 修改JavaScript代码
    const side = document.querySelector('.side')
    const chatBox = document.querySelector('.chat-box')
    let isCollapsed = false // 状态变量

    // 改进交互逻辑
    side.addEventListener('mouseenter', function () {
      if (isCollapsed) {
        // 展开侧边栏
        side.classList.remove('collapsed')
        chatBox.style.width = '80%'
        isCollapsed = false
      }
    })

    // 使用延时触发收起，避免快速移动鼠标时误触发
    let timeoutId
    side.addEventListener('mouseleave', function () {
      timeoutId = setTimeout(() => {
        side.classList.add('collapsed')
        chatBox.style.width = 'calc(100% - 50px)'
        isCollapsed = true
      }, 500) // 500ms延时
    })

    // 当鼠标重新进入时清除延时
    side.addEventListener('mouseenter', function () {
      clearTimeout(timeoutId)
    })

    // 初始状态：保持展开
    side.classList.remove('collapsed')
    isCollapsed = false