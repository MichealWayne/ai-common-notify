import * as path from 'path';
import { promises as fsp } from 'fs';

/**
 * 检查当前运行平台是否为Windows
 * @returns boolean
 */
export function isWindows(): boolean {
  return process.platform === 'win32';
}

/**
 * 检查当前运行平台是否为macOS
 * @returns boolean
 */
export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

/**
 * 检查当前运行平台是否为Linux
 * @returns boolean
 */
export function isLinux(): boolean {
  return process.platform === 'linux';
}

/**
 * 检查目录是否存在
 * @param dirPath 目录路径
 * @returns Promise<boolean>
 */
export async function isDirectoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fsp.stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns Promise<boolean>
 */
export async function isFileExists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 * @returns Promise<void>
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // 目录可能已存在，忽略错误
  }
}

/**
 * 获取规范化的路径
 * @param filePath 文件路径
 * @returns string
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}