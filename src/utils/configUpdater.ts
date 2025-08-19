import * as fs from 'fs';
import { promises as fsp } from 'fs';

/**
 * 安全地更新JSON配置文件
 * @param filePath 配置文件路径
 * @param newConfig 要合并的新配置
 */
export async function updateJsonFile(filePath: string, newConfig: any): Promise<void> {
  try {
    let existingConfig = {};
    
    // 如果文件存在，读取现有配置
    if (fs.existsSync(filePath)) {
      const fileContent = await fsp.readFile(filePath, 'utf8');
      if (fileContent.trim()) {
        existingConfig = JSON.parse(fileContent);
      }
    }
    
    // 合并配置（新配置会覆盖同名的现有配置项）
    const mergedConfig = deepMerge(existingConfig, newConfig);
    
    // 创建备份
    if (fs.existsSync(filePath)) {
      const backupPath = filePath + '.backup';
      await fsp.copyFile(filePath, backupPath);
    }
    
    // 写入更新后的配置
    const jsonString = JSON.stringify(mergedConfig, null, 2);
    await fsp.writeFile(filePath, jsonString, 'utf8');
  } catch (error: unknown) {
      throw new Error(`Failed to append to file ${filePath}: ${(error as Error).message}`);
    }
}

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * 检查值是否为对象
 * @param item 要检查的值
 * @returns 是否为对象
 */
function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}