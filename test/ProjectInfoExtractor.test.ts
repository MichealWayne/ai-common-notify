import * as path from 'path';
import * as os from 'os';
import { extractProjectInfo } from '../src/utils/ProjectInfoExtractor';

describe('ProjectInfoExtractor', () => {
  it('should extract project info from Claude-style path', () => {
    const testPath = '/home/user/projects/my-project/.claude/tmp/session-123/transcript.txt';
    const projectInfo = extractProjectInfo(testPath);
    
    expect(projectInfo.projectName).toBe('my-project');
    expect(projectInfo.projectPath).toBe('/home/user/projects/my-project');
  });

  it('should handle paths without .claude directory', () => {
    const testPath = '/home/user/projects/my-project/src/index.js';
    const projectInfo = extractProjectInfo(testPath);
    
    // Just check that it returns some reasonable values
    expect(projectInfo.projectName).toBeTruthy();
    expect(projectInfo.projectPath).toBeTruthy();
  });

  it('should use fallback when path analysis fails', () => {
    // Mock process.cwd() to return a known path
    const originalCwd = process.cwd;
    process.cwd = () => '/home/user/projects/my-test-project';
    
    const testPath = '/random/unrelated/path.txt';
    const projectInfo = extractProjectInfo(testPath);
    
    // Just check that it returns some reasonable values
    expect(projectInfo.projectName).toBeTruthy();
    expect(projectInfo.projectPath).toBeTruthy();
    
    // Restore original cwd
    process.cwd = originalCwd;
  });
});