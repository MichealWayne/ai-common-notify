import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// 定义日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 定义日志条目接口
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  details?: any;
  method?: string | undefined;
  file?: string | undefined;
}

// 日志管理器类
class Logger {
  private logFilePath: string;
  private logLevel: LogLevel;

  constructor() {
    // 设置日志文件路径
    const configDir = this.getConfigDir();
    this.logFilePath = path.join(configDir, 'error.log');

    // 确保配置目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 设置默认日志级别
    this.logLevel = 'debug';
  }

  // 获取配置目录路径
  private getConfigDir(): string {
    const homeDir = os.homedir();
    if (os.platform() === 'win32') {
      return path.join(process.env['APPDATA'] || homeDir, 'ai-common-notify');
    } else {
      return path.join(homeDir, '.config', 'ai-common-notify');
    }
  }

  // 记录日志
  private log(
    level: LogLevel,
    component: string,
    message: string,
    details?: any,
    method?: string,
    file?: string
  ): void {
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return;
    }

    // 创建日志条目，使用本地时间格式
    const logEntry: LogEntry = {
      timestamp: new Date().toString(), // 使用本地时间格式而不是ISO格式
      level,
      component,
      message,
      details,
      method: method ?? undefined,
      file: file ?? undefined,
    };

    // 格式化日志条目为字符串
    const logString = JSON.stringify(logEntry);

    // 异步写入日志文件，避免阻塞主线程
    fs.promises.appendFile(this.logFilePath, logString + '\n').catch(error => {
      console.error('Failed to write to log file:', error);
    });
  }

  // 检查是否应该记录指定级别的日志
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  // 记录debug级别日志
  debug(component: string, message: string, details?: any, method?: string, file?: string): void {
    this.log('debug', component, message, details, method, file);
  }

  // 记录info级别日志
  info(component: string, message: string, details?: any, method?: string, file?: string): void {
    this.log('info', component, message, details, method, file);
  }

  // 记录warn级别日志
  warn(component: string, message: string, details?: any, method?: string, file?: string): void {
    this.log('warn', component, message, details, method, file);
  }

  // 记录error级别日志
  error(component: string, message: string, details?: any, method?: string, file?: string): void {
    this.log('error', component, message, details, method, file);
  }

  // 获取所有日志内容
  public getAllLogs(): LogEntry[] {
    try {
      // 检查日志文件是否存在
      if (!fs.existsSync(this.logFilePath)) {
        return [];
      }

      // 读取日志文件内容
      const content = fs.readFileSync(this.logFilePath, 'utf-8');

      // 解析日志条目
      const logs: LogEntry[] = [];
      const lines = content.split('\n').filter(line => line.trim() !== '');

      // 获取日志保留时间配置（默认为1天）
      // 注意：我们不能在这里导入ConfigManager，因为它会创建循环依赖
      // 所以我们使用默认值24小时
      const retentionHours = 24;
      const cutoffTime = Date.now() - retentionHours * 60 * 60 * 1000;

      for (const line of lines) {
        try {
          const logEntry: LogEntry = JSON.parse(line);
          // 只返回在保留时间范围内的日志
          // 统一使用ISO格式时间解析
          const logTime = new Date(logEntry.timestamp).getTime();
          
          if (logTime >= cutoffTime) {
            logs.push(logEntry);
          }
        } catch (error) {
          console.error('Failed to parse log entry:', error);
        }
      }

      return logs;
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  // 获取错误日志内容
  public getErrorLogs(): LogEntry[] {
    const allLogs = this.getAllLogs();
    return allLogs.filter(log => log.level === 'error');
  }
}

// 创建并导出日志管理器实例
export const logger = new Logger();
