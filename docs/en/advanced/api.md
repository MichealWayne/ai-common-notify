# API Reference

This guide provides detailed documentation for the REST API endpoints available in AI Common Notify.

## Starting the API Server

To start the REST API server, use the following command:

```bash
ai-common-notify api
```

By default, the server will start on port 6001. You can specify a different port using the `-p` or `--port` option:

```bash
ai-common-notify api --port 8080
```

## Authentication

The API supports optional token-based authentication. To enable authentication, set the `server.token` configuration option in your configuration file:

```json
{
  "server": {
    "port": 6001,
    "host": "localhost",
    "token": "your-secret-token"
  }
}
```

When a token is configured, you must include it in the `Authorization` header of your requests:

```
Authorization: Bearer your-secret-token
```

## API Endpoints

### Send Notification

Sends a system notification through the AI Common Notify service.

**Endpoint:** `POST /api/v1/notify`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer [token]` (optional, required if token is configured)

**Request Body:**

```json
{
  "title": "string",          // Required: Notification title
  "message": "string",        // Required: Notification message
  "urgency": "low|normal|critical", // Optional: Notification urgency (default: "normal")
  "timeout": 0,               // Optional: Notification timeout in seconds (0 for permanent, default: 0)
  "sound": true,              // Optional: Play notification sound (default: true)
  "project_name": "string",   // Optional: Project name for context
  "tool_name": "string"       // Optional: Tool name for tool-specific configuration
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification sent"
}
```

**Example:**

```bash
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token" \
  -d '{
    "title": "API Test",
    "message": "This notification was sent via REST API",
    "urgency": "normal",
    "timeout": 0,
    "sound": true
  }'
```

### Health Check

Checks if the API server is running and healthy.

**Endpoint:** `GET /api/v1/health`

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## Error Responses

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK` - Request was successful
- `400 Bad Request` - Invalid request data (e.g., missing required fields)
- `401 Unauthorized` - Authentication failed or token is invalid
- `500 Internal Server Error` - An unexpected error occurred

Error responses include a JSON body with an error message:

```json
{
  "error": "Description of the error"
}
```

## Using the API with Other Tools

Any tool that can make HTTP requests can use the AI Common Notify REST API. Here are some examples:

### Using with cURL

```bash
# Send a simple notification
curl -X POST http://localhost:6001/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Task Complete",
    "message": "Your task has finished successfully"
  }'
```

### Using with Python

```python
import requests

response = requests.post(
    'http://localhost:6001/api/v1/notify',
    json={
        'title': 'Task Complete',
        'message': 'Your task has finished successfully',
        'urgency': 'normal',
        'timeout': 0,
        'sound': True
    }
)

if response.status_code == 200:
    print("Notification sent successfully")
else:
    print(f"Error: {response.json()['error']}")
```

### Using with Node.js

```javascript
const axios = require('axios');

axios.post('http://localhost:6001/api/v1/notify', {
  title: 'Task Complete',
  message: 'Your task has finished successfully',
  urgency: 'normal',
  timeout: 0,
  sound: true
})
.then(response => {
  console.log('Notification sent successfully');
})
.catch(error => {
  console.error('Error:', error.response.data.error);
});
```

## Best Practices

1. **Handle Errors Gracefully**: Always check the HTTP status code and handle errors appropriately in your applications
2. **Use Authentication**: If you're using the API in a production environment, always configure and use authentication
3. **Set Appropriate Timeouts**: Use appropriate timeout values for your notifications to avoid them staying too long
4. **Test Your Integration**: Test your API integration thoroughly to ensure notifications are working as expected
5. **Monitor Logs**: Use `ai-common-notify errlog` to monitor for issues with API requests

## Troubleshooting

### API Server Not Starting

If the API server fails to start:

1. Check if the port is already in use by another process
2. Verify that you have permission to bind to the specified port
3. Check the error logs: `ai-common-notify errlog`

### Authentication Issues

If you're getting 401 errors:

1. Verify that your token is correctly configured in the server
2. Ensure you're sending the correct Authorization header
3. Check that the token value matches exactly

### Notification Not Appearing

If the API returns success but the notification doesn't appear:

1. Check system notification settings
2. Verify that the notification parameters are valid
3. Check the AI Common Notify logs: `ai-common-notify errlog`

---
*AI Common Notify - Simplifying notifications for AI coding tools*