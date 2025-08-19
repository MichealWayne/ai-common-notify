import * as path from 'path';
import { promises as fs } from 'fs';

/**
 * 验证脚本路径是否安全
 * @param scriptPath 脚本路径
 * @param allowedDirs 允许的目录列表
 * @returns 是否安全
 */
export async function validateScriptPath(scriptPath: string, allowedDirs: string[] = []): Promise<boolean> {
  try {
    // 必须是绝对路径
    if (!path.isAbsolute(scriptPath)) {
      return false;
    }

    // 解析真实路径（防止符号链接攻击）
    const realPath = await fs.realpath(scriptPath);
    
    // 检查是否在允许的目录中
    if (allowedDirs.length > 0) {
      // 等待所有异步操作完成
      const results = await Promise.all(allowedDirs.map(async (dir) => {
        try {
          // 解析允许目录的真实路径
          const realDir = await fs.realpath(dir);
          // 确保目录路径以路径分隔符结尾，以避免部分匹配
          const normalizedDir = realDir.endsWith(path.sep) ? realDir : realDir + path.sep;
          const normalizedPath = realPath + path.sep;
          return normalizedPath.startsWith(normalizedDir) || realPath.startsWith(realDir);
        } catch (error) {
          // 如果无法解析目录，返回false
          return false;
        }
      }));
      
      const isInAllowedDir = results.some(result => result);
      
      if (!isInAllowedDir) {
        return false;
      }
    }

    // 检查文件扩展名
    const ext = path.extname(realPath).toLowerCase();
    const allowedExtensions = ['.sh', '.js', '.cjs'];
    
    if (!allowedExtensions.includes(ext)) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}