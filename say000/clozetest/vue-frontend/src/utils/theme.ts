/**
 * 主题管理工具
 * 实现系统主题检测和自动切换机制
 */

export type ThemeMode = 'light' | 'dark' | 'auto'

export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: ThemeMode = 'auto'
  private mediaQuery: MediaQueryList
  private listeners: Set<(isDark: boolean) => void> = new Set()

  private constructor() {
    // 创建媒体查询监听器
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    // 监听系统主题变化
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this))
    
    // 初始化主题
    this.initTheme()
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  /**
   * 初始化主题
   */
  private initTheme(): void {
    // 从localStorage读取用户偏好，默认为auto
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    this.currentTheme = savedTheme || 'auto'
    
    // 应用主题
    this.applyTheme()
  }

  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    if (this.currentTheme === 'auto') {
      this.applyTheme()
      this.notifyListeners(e.matches)
    }
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    const isDark = this.isDarkMode()
    
    // 更新HTML根元素的data-theme属性
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    
    // 更新body的class
    document.body.classList.toggle('dark-mode', isDark)
    document.body.classList.toggle('light-mode', !isDark)
    
    // 通知监听器
    this.notifyListeners(isDark)
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(isDark: boolean): void {
    this.listeners.forEach(listener => listener(isDark))
  }

  /**
   * 判断当前是否为深色模式
   */
  public isDarkMode(): boolean {
    switch (this.currentTheme) {
      case 'dark':
        return true
      case 'light':
        return false
      case 'auto':
      default:
        return this.mediaQuery.matches
    }
  }

  /**
   * 设置主题模式
   */
  public setTheme(theme: ThemeMode): void {
    this.currentTheme = theme
    localStorage.setItem('theme-mode', theme)
    this.applyTheme()
  }

  /**
   * 获取当前主题模式
   */
  public getTheme(): ThemeMode {
    return this.currentTheme
  }

  /**
   * 切换主题（在light、dark、auto之间循环）
   */
  public toggleTheme(): void {
    const themes: ThemeMode[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.setTheme(themes[nextIndex])
  }

  /**
   * 添加主题变化监听器
   */
  public addListener(listener: (isDark: boolean) => void): void {
    this.listeners.add(listener)
    // 立即调用一次，传递当前状态
    listener(this.isDarkMode())
  }

  /**
   * 移除主题变化监听器
   */
  public removeListener(listener: (isDark: boolean) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 获取系统主题偏好
   */
  public getSystemTheme(): 'light' | 'dark' {
    return this.mediaQuery.matches ? 'dark' : 'light'
  }

  /**
   * 销毁实例（清理资源）
   */
  public destroy(): void {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange)
    this.listeners.clear()
  }
}

// 导出单例实例
export const themeManager = ThemeManager.getInstance()

// 导出便捷函数
export const isDarkMode = () => themeManager.isDarkMode()
export const setTheme = (theme: ThemeMode) => themeManager.setTheme(theme)
export const toggleTheme = () => themeManager.toggleTheme()
export const addThemeListener = (listener: (isDark: boolean) => void) => themeManager.addListener(listener)
export const removeThemeListener = (listener: (isDark: boolean) => void) => themeManager.removeListener(listener)