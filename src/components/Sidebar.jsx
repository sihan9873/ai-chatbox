import React, { useState, useRef, useEffect } from 'react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // 组件卸载时清除定时器
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 500);
  };

  return (
    <div className={`side ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="side-content">侧边栏内容</div>
    </div>
  );
};

export default Sidebar;