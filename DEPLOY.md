# 生产环境部署说明

## 打包结果

✅ 生产环境打包成功！

- **打包目录**: `dist/`
- **WebSocket 地址**: `ws://103.236.57.23:3000`
- **构建时间**: 726ms
- **打包大小**:
  - HTML: 0.45 kB (gzip: 0.29 kB)
  - CSS: 370.43 kB (gzip: 52.92 kB)
  - JS: 999.23 kB (gzip: 316.65 kB)

## 环境配置

已创建两个环境配置文件：

### 开发环境 (`.env.development`)
```
VITE_WS_URL=ws://127.0.0.1:3000
```

### 生产环境 (`.env.production`)
```
VITE_WS_URL=ws://103.236.57.23:3000
```

## 部署步骤

### 方案 1: 上传到服务器静态文件目录

1. 将 `dist` 目录中的所有文件上传到服务器
2. 配置 Nginx 或其他 Web 服务器指向该目录

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    # Vue Router 的 History 模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 方案 2: 使用 SCP 上传

```bash
# 压缩 dist 目录
tar -czf dist.tar.gz dist/

# 上传到服务器
scp dist.tar.gz user@103.236.57.23:/path/to/deploy/

# 登录服务器并解压
ssh user@103.236.57.23
cd /path/to/deploy/
tar -xzf dist.tar.gz
```

### 方案 3: 使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等工具直接上传 `dist` 目录。

## 验证部署

1. 访问你的网站
2. 打开浏览器控制台，查看是否有以下日志：
   ```
   [WebSocket] 使用的 WebSocket 地址: ws://103.236.57.23:3000
   [WebSocket] 连接成功
   ```
3. 测试聊天功能是否正常

## 注意事项

1. **WebSocket 端口**: 确保服务器的 3000 端口对外开放
2. **防火墙规则**: 检查防火墙是否允许 WebSocket 连接
3. **HTTPS**: 如果网站使用 HTTPS，WebSocket 也需要使用 WSS（加密连接）
   - 修改 `.env.production` 为: `VITE_WS_URL=wss://103.236.57.23:3000`
4. **跨域问题**: WebSocket 连接可能需要配置 CORS

## 如果需要重新打包

```bash
# 开发环境打包（本地测试）
npm run dev

# 生产环境打包
npm run build

# 预览生产构建
npm run preview
```

## 更新 WebSocket 地址

如果需要修改生产环境的服务器地址，编辑 `.env.production` 文件：

```bash
# 修改为新的服务器地址
VITE_WS_URL=ws://新的IP:端口

# 重新打包
npm run build
```

## 文件结构

```
dist/
├── index.html           # 入口 HTML 文件
├── vite.svg            # Logo
├── assets/             # 静态资源
│   ├── index-*.css    # 样式文件
│   └── index-*.js     # JavaScript 文件
└── img/                # 图片资源
```

## 故障排查

### WebSocket 连接失败

1. 检查服务器 WebSocket 服务是否运行
2. 检查防火墙是否开放 3000 端口
3. 检查浏览器控制台的错误信息

### 页面无法加载

1. 检查 Nginx 配置是否正确
2. 检查文件权限是否正确
3. 检查静态文件路径是否正确

### 聊天功能不工作

1. 确认 WebSocket 连接已建立
2. 检查 token 是否有效
3. 查看浏览器控制台和网络请求

## 联系支持

如有问题，请检查：
- 浏览器控制台（F12）
- 服务器日志
- WebSocket 连接状态
