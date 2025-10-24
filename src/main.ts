import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './utils/theme'

// 导入Vant组件
import { Icon, showConfirmDialog } from 'vant'
import 'vant/lib/index.css'

// 处理浏览器扩展的runtime.lastError警告
if (typeof window !== 'undefined') {
  // 监听并忽略扩展相关的消息端口错误
  const originalAddEventListener = window.addEventListener
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'message') {
      const wrappedListener = function(event: MessageEvent) {
        try {
          // 检查是否是扩展相关的消息
          if (event.source !== window && 
              (event.origin.includes('chrome-extension://') || 
               event.origin.includes('moz-extension://') ||
               event.origin.includes('safari-extension://') ||
               event.origin.includes('ms-browser-extension://'))) {
            return // 忽略扩展消息
          }
          return listener.call(this, event)
        } catch (error) {
          // 忽略扩展相关的错误
          if (error instanceof Error && 
              (error.message.includes('Extension context invalidated') ||
               error.message.includes('Could not establish connection') ||
               error.message.includes('message port closed'))) {
            return
          }
          throw error
        }
      }
      return originalAddEventListener.call(this, type, wrappedListener, options)
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
}

// 全局错误处理器 - 忽略浏览器扩展相关的错误
window.addEventListener('error', (event) => {
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
    return false
  }
})

// 处理未捕获的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
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
    return false
  }
})

const app = createApp(App)

// Vue应用级错误处理
app.config.errorHandler = (err: unknown, _instance: unknown, _info: string) => {
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
    return
  }
  
  // 对于非扩展错误，正常处理
  console.error('Vue应用错误:', error, _info)
}

// 注册Vant组件
app.use(Icon)

app.use(router)
app.mount('#app')
