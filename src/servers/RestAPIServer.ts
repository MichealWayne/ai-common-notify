import express from 'express';
import cors from 'cors';
import { NotificationManager } from '../core/NotificationManager';
import { NotificationOptions } from '../core/NotificationManager';

export class RestAPIServer {
  private app: express.Application;
  private notificationManager: NotificationManager;

  constructor() {
    this.app = express();
    this.notificationManager = new NotificationManager();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    // 发送通知
    this.app.post('/api/v1/notify', async (req, res) => {
      try {
        const { title, message, urgency, timeout, sound, project_name, tool_name } = req.body;

        if (!title || !message) {
          return res.status(400).json({ error: 'Title and message are required' });
        }

        const options: NotificationOptions = {
          title,
          message,
          urgency,
          timeout,
          sound,
          projectName: project_name,
          toolName: tool_name,
        };

        const success = await this.notificationManager.sendNotification(options);

        return res.json({
          success,
          message: success ? 'Notification sent' : 'Failed to send notification',
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    });

    // 健康检查
    this.app.get('/api/v1/health', (_req, res) => {
      return res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  start(port: number = 6001) {
    this.app.listen(port, () => {
      console.log(`REST API server listening on port ${port}`);
    });
  }
}