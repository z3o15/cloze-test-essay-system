# EdgeOne 缓存清除指南

## 问题描述
部署到EdgeOne后网站仍显示旧版本，即使强制刷新浏览器缓存也无效。

## 原因分析
EdgeOne的边缘节点缓存了旧版本的静态资源，需要手动清除CDN缓存。

## 解决方案

### 方法一：通过EdgeOne控制台清除缓存

#### 1. 登录EdgeOne控制台
- 访问：https://console.cloud.tencent.com/edgeone
- 选择对应的站点

#### 2. 进入缓存管理
- 在左侧菜单中找到"缓存管理" → "清除缓存"

#### 3. 选择清除类型

**推荐清除方案（按优先级）：**

1. **全部缓存清除**（最彻底）
   - 类型：全部缓存
   - 方式：直接删除
   - 说明：清除站点所有缓存，确保获取最新内容

2. **目录清除**（针对性强）
   - 类型：目录
   - 内容：`https://your-domain.com/assets/`
   - 方式：直接删除
   - 说明：清除所有静态资源缓存

3. **URL清除**（精确控制）
   - 类型：URL
   - 内容：
     ```
     https://your-domain.com/
     https://your-domain.com/index.html
     https://your-domain.com/assets/index-DkUwBXp4.js
     https://your-domain.com/assets/index-CIM-cgny.css
     ```

### 方法二：通过API清除缓存

如果需要自动化清除，可以使用EdgeOne API：

```bash
# 使用腾讯云CLI
tccli edgeone PurgeCache --cli-unfold-argument \
    --ZoneId your-zone-id \
    --Type purge_url \
    --Targets https://your-domain.com/
```

### 方法三：修改缓存策略（预防措施）

在EdgeOne控制台的"规则引擎"中添加规则：

1. **HTML文件不缓存**
   - 匹配条件：文件后缀 等于 `.html`
   - 操作：缓存 → 不缓存

2. **静态资源短缓存**
   - 匹配条件：文件后缀 包含 `.js,.css`
   - 操作：缓存 → 自定义时间 → 1小时

## 验证步骤

### 1. 清除缓存后验证
1. 等待2-5分钟（缓存清除需要时间同步到所有边缘节点）
2. 使用无痕浏览模式访问网站
3. 检查开发者工具中的网络请求，确认资源是否从源站获取

### 2. 检查缓存状态
在浏览器开发者工具的Network标签中查看响应头：
- `X-Cache: MISS` 表示未命中缓存，从源站获取
- `X-Cache: HIT` 表示命中缓存

### 3. 验证功能
确认新功能（段落翻译）是否正常工作。

## 常见问题

### Q: 清除缓存后仍显示旧版本？
A: 
1. 检查浏览器本地缓存：Ctrl+F5 强制刷新
2. 尝试不同浏览器或无痕模式
3. 检查是否有多层CDN（如Cloudflare）
4. 等待更长时间（最多15分钟）

### Q: 如何避免未来出现此问题？
A:
1. 设置合适的缓存策略
2. 使用版本化的静态资源文件名
3. 在部署脚本中自动清除缓存

## 部署流程优化建议

### 1. 添加自动缓存清除
在部署脚本中添加缓存清除步骤：

```json
{
  "scripts": {
    "deploy": "npm run build && npm run deploy:edgeone && npm run cache:clear",
    "cache:clear": "echo '请手动清除EdgeOne缓存或配置API自动清除'"
  }
}
```

### 2. 使用文件指纹
确保构建工具生成带hash的文件名，避免缓存问题：
- `index-DkUwBXp4.js` ✅ 已使用hash
- `index-CIM-cgny.css` ✅ 已使用hash

## 当前状态检查

### 构建文件状态 ✅
- 构建时间：2025/10/22 9:08:43
- 包含最新修改：段落翻译功能已打包
- 文件完整性：正常

### Git状态 ✅  
- 最新提交：10ac437 添加安全的.env.example配置模板
- 工作区：干净，无未提交修改
- 远程同步：已推送到GitHub

### 下一步操作
1. 立即执行EdgeOne缓存清除
2. 等待5-10分钟后验证
3. 如仍有问题，检查EdgeOne部署状态

---

**注意：** 清除缓存会导致短时间内回源请求增加，可能影响源站性能。建议在低峰期操作。