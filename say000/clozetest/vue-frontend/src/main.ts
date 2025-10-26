import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './utils/theme'

// 导入Vant组件
import { Icon } from 'vant'
import 'vant/lib/index.css'

// 处理浏览器扩展的runtime.lastError警告
if (typeof window !== 'undefined') {
  // 监听并忽略扩展相关的消息端口错误
  const originalAddEventListener = window.addEventListener
  // 显式声明箭头函数返回类型为 void，避免返回值推断问题
  window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    if (type === 'message') {
      // 显式声明 wrappedListener 返回类型为 void
      const wrappedListener = function(this: any, event: Event): void {
        try {
          const messageEvent = event as MessageEvent;
          // 检查是否是扩展相关的消息
          if (messageEvent.source !== window && 
              (messageEvent.origin.includes('chrome-extension://') || 
               messageEvent.origin.includes('moz-extension://') ||
               messageEvent.origin.includes('safari-extension://') ||
               messageEvent.origin.includes('ms-browser-extension://'))) {
            return // 忽略扩展消息，提前返回
          }
          if (typeof listener === 'function') {
            listener.call(this, event);
            return; // 执行后返回，确保路径完整
          } else if (listener && typeof listener.handleEvent === 'function') {
            listener.handleEvent(event);
            return; // 执行后返回，确保路径完整
          }
        } catch (error: any) {
          // 忽略扩展相关的错误
          if (error instanceof Error && 
              (error.message.includes('Extension context invalidated') ||
               error.message.includes('Could not establish connection') ||
               error.message.includes('message port closed'))) {
            return; // 忽略错误，提前返回
          }
          throw error;
        }
      }
      originalAddEventListener.call(this, type, wrappedListener, options);
      return; // 执行后返回，确保路径完整
    }
    originalAddEventListener.call(this, type, listener, options);
    return; // 执行后返回，确保路径完整
  }
}

// 全局错误处理器 - 忽略浏览器扩展相关的错误
// 显式声明事件处理函数返回类型为 void，解决 TS7030
window.addEventListener('error', (event): void => {
  const error = event.error
  const message = event.message || ''
  
  // 检查是否是浏览器扩展相关的错误
  const isExtensionError = 
    message.includes('Extension context invalidated') ||
    message.includes('Could not establish connection') ||
    message.includes('chrome-extension://') ||
    message.includes('moz-extension://') ||
    message.includes('safari-extension://') ||
    message.includes('ms-browser-extension://') ||
    (error && error.stack && (
      error.stack.includes('chrome-extension://') ||
      error.stack.includes('moz-extension://') ||
      error.stack.includes('safari-extension://') ||
      error.stack.includes('ms-browser-extension://')
    ))
  
  if (isExtensionError) {
    // 阻止错误冒泡到控制台
    event.preventDefault()
    event.stopPropagation()
    console.debug('忽略浏览器扩展错误:', message)
    return; // 显式返回，确保路径完整
  }
  // 非扩展错误无需额外返回（无处理逻辑，路径自然结束）
})

// 处理未捕获的Promise拒绝
// 显式声明事件处理函数返回类型为 void，解决 TS7030
window.addEventListener('unhandledrejection', (event): void => {
  const reason = event.reason
  const message = reason?.message || reason?.toString() || ''
  
  // 检查是否是浏览器扩展相关的错误
  const isExtensionError = 
    message.includes('Extension context invalidated') ||
    message.includes('Could not establish connection') ||
    message.includes('chrome-extension://') ||
    message.includes('moz-extension://') ||
    message.includes('safari-extension://') ||
    message.includes('ms-browser-extension://') ||
    (reason && reason.stack && (
      reason.stack.includes('chrome-extension://') ||
      reason.stack.includes('moz-extension://') ||
      reason.stack.includes('safari-extension://') ||
      reason.stack.includes('ms-browser-extension://')
    ))
  
  if (isExtensionError) {
    // 阻止错误冒泡到控制台
    event.preventDefault()
    console.debug('忽略浏览器扩展Promise拒绝:', message)
    return; // 显式返回，确保路径完整
  }
  // 非扩展错误无需额外返回（无处理逻辑，路径自然结束）
})

const app = createApp(App)

// Vue应用级错误处理
// 显式声明错误处理函数返回类型为 void
app.config.errorHandler = (err: unknown, _instance: unknown, _info: string): void => {
  const error = err as Error
  const message = error?.message || error?.toString() || ''
  
  // 检查是否是浏览器扩展相关的错误
  const isExtensionError = 
    message.includes('Extension context invalidated') ||
    message.includes('Could not establish connection') ||
    message.includes('chrome-extension://') ||
    message.includes('moz-extension://') ||
    message.includes('safari-extension://') ||
    message.includes('ms-browser-extension://') ||
    (error && error.stack && (
      error.stack.includes('chrome-extension://') ||
      error.stack.includes('moz-extension://') ||
      error.stack.includes('safari-extension://') ||
      error.stack.includes('ms-browser-extension://')
    ))
  
  if (isExtensionError) {
    console.debug('忽略Vue应用中的浏览器扩展错误:', message)
    return; // 显式返回，确保路径完整
  }
  
  // 对于非扩展错误，正常处理
  console.error('Vue应用错误:', error, _info)
  return; // 显式返回，确保路径完整
}

// 注册Vant组件
app.use(Icon)

app.use(router)
app.mount('#app')