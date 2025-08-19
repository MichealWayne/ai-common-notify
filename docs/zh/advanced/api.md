# API 参考

本指南提供了 AI Common Notify 中可用的 REST API 端点的详细文档。

## 启动 API 服务器

要启动 REST API 服务器，请使用以下命令：

```bash
ai-common-notify api
```

默认情况下，服务器将在端口 6001 上启动。您可以使用 `-p` 或 `--port` 选项指定不同的端口：

```bash
ai-common-notify api --port 8080
```

## 认证

API 支持可选的基于令牌的认证。要启用认证，请在配置文件中设置 `server.token` 配置选项：

```json
{
  "server": {
    "port": 6001,
    "host": "localhost",
    "token": "your-secret-token"
  }
}
```

配置令牌后，您必须在请求的 `Authorization` 头中包含它：

```
Authorization: Bearer your-secret-token
```

## API 端点

### 发送通知

通过 AI Common Notify 服务发送系统通知。

**端点:** `POST /api/v1/notify`

**请求头:**
- `Content-Type: application/json`
- `Authorization: Bearer [token]` (可选，如果配置了令牌则必需)

**请求体:**

```json
{
  "title": "string",          // 必需: 通知标题
  "message": "string",        // 必需: 通知消息
  "urgency": "low|normal|critical", // 可选: 通知紧急程度 (默认: "normal")
  "timeout": 0,               // 可选: 通知超时时间（秒）(0 表示永久, 默认: 0)
  "sound": true,              // 可选: 播放通知声音 (默认: true)
  "project_name": "string",   // 可选: 项目名称用于上下文
  "tool_name": "string"       // 可选: 工具名称用于工具特定配置
}
```

**响应:**

```json
{
  "success": true,
  "message": "Notification sent"
}
```

**示例:**

```bash
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "title": "API 测试",
    "message": "此通知通过 REST API 发送",
    "urgency": "normal",
    "timeout": 0,
    "sound": true
  }'
```

### 健康检查

检查 API 服务器是否正在运行且健康。

**端点:** `GET /api/v1/health`

**响应:**

```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## 错误响应

API 使用标准 HTTP 状态码来指示请求的成功或失败：

- `200 OK` - 请求成功
- `400 Bad Request` - 无效的请求数据（例如，缺少必需字段）
- `401 Unauthorized` - 认证失败或令牌无效
- `500 Internal Server Error` - 发生意外错误

错误响应包含带有错误消息的 JSON 体：

```json
{
  "error": "错误描述"
}
```

## 与其他工具一起使用 API

任何可以发起 HTTP 请求的工具都可以使用 AI Common Notify REST API。以下是一些示例：

### 使用 cURL

```bash
# 发送简单通知
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "任务完成",
    "message": "您的任务已成功完成"
  }'
```

### 使用 Python

```python
import requests

response = requests.post(
    'http://localhost:6001/api/v1/notify',
    json={
        'title': '任务完成',
        'message': '您的任务已成功完成',
        'urgency': 'normal',
        'timeout': 0,
        'sound': True
    }
)

if response.status_code == 200:
    print("通知发送成功")
else:
    print(f"错误: {response.json()['error']}")
```

### 使用 Node.js

```javascript
const axios = require('axios');

axios.post('http://localhost:6001/api/v1/notify', {
  title: '任务完成',
  message: '您的任务已成功完成',
  urgency: 'normal',
  timeout: 0,
  sound: true
})
.then(response => {
  console.log('通知发送成功');
})
.catch(error => {
  console.error('错误:', error.response.data.error);
});
```

## 最佳实践

1. **优雅地处理错误**: 始终检查 HTTP 状态码并适当地处理错误
2. **使用认证**: 如果您在生产环境中使用 API，请始终配置和使用认证
3. **设置适当的超时时间**: 为通知使用适当的超时值，以避免它们停留太久
4. **测试您的集成**: 彻底测试您的 API 集成，以确保通知正常工作
5. **监控日志**: 使用 `ai-common-notify errlog` 监控 API 请求问题

## 故障排除

### API 服务器无法启动

如果 API 服务器无法启动：

1. 检查端口是否已被其他进程占用
2. 验证您是否有权限绑定到指定端口
3. 检查错误日志：`ai-common-notify errlog`

### 认证问题

如果您收到 401 错误：

1. 验证您的令牌是否在服务器中正确配置
2. 确保您发送了正确的 Authorization 头
3. 检查令牌值是否完全匹配

### 通知未出现

如果 API 返回成功但通知未出现：

1. 检查系统通知设置
2. 验证通知参数是否有效
3. 检查 AI Common Notify 日志：`ai-common-notify errlog`

---
*AI Common Notify - 简化 AI 编程工具的通知*