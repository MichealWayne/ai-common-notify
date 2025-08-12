import * as path from 'path';
import * as os from 'os';

export interface ProjectInfo {
  projectName: string;
  projectPath: string;
}

/**
 * Extracts project information from a given file path.
 * 
 * @param filePath - The file path to extract project information from
 * @returns ProjectInfo object containing projectName and projectPath
 */
export function extractProjectInfo(filePath: string): ProjectInfo {
  try {
    // Convert to Path object for easier manipulation
    const normalizedPath = path.normalize(filePath);
    const pathParts = normalizedPath.split(path.sep);
    
    // The transcript is typically in .claude/tmp/<session_id>/transcript.txt
    // We want to find the project root (parent of .claude)
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      
      // Look for .claude in the path
      if (part === '.claude') {
        if (i > 0) {
          // This is a project-specific .claude directory
          const projectPath = pathParts.slice(0, i).join(path.sep);
          const projectName = pathParts[i - 1] || '';
          
          // Check if .claude is in user's home directory (global Claude session)
          const homePath = os.homedir();
          if (projectPath === homePath) {
            // This is a global Claude session, try to get actual project
            return getFallbackProjectInfo();
          }
          
          return {
            projectName,
            projectPath
          };
        }
      }
    }
    
    // If no .claude found, try to extract meaningful directory info
    // Look for common project indicators
    for (let i = pathParts.length - 1; i >= 0; i--) {
      const part = pathParts[i];
      
      // Skip common temp/hidden directories
      if (part === 'tmp' || part === 'temp' || part === '.claude' || 
          part === '.git' || part === '__pycache__' || part === 'node_modules') {
        continue;
      }
      
      // Skip session-like IDs (long alphanumeric strings)
      if (part && part.length > 20 && /^[a-zA-Z0-9_-]+$/.test(part)) {
        continue;
      }
      
      // This might be a project directory
      if (i > 0 && part) {
        const projectPath = pathParts.slice(0, i + 1).join(path.sep);
        const projectName = part;
        return {
          projectName,
          projectPath
        };
      }
    }
    
    // Fallback to current working directory detection
    return getFallbackProjectInfo();
  } catch (error) {
    console.error(`Error extracting project info from path: ${filePath}`, error);
    return getFallbackProjectInfo();
  }
}

/**
 * Gets fallback project information when path analysis fails.
 * 
 * @returns ProjectInfo object with fallback information
 */
function getFallbackProjectInfo(): ProjectInfo {
  try {
    // Try to get current working directory
    const cwd = process.cwd();
    const cwdPath = path.resolve(cwd);
    
    // Extract project name from current working directory
    const projectName = path.basename(cwdPath);
    
    // Avoid generic directory names and user names
    const genericNames = [
      'home', 'tmp', 'temp', 'desktop', 'documents', 'downloads',
      'users', 'user', 'workspace', 'projects'
    ];
    
    // Common user names (this is a partial list)
    const userNames = [
      'james', 'alice', 'bob', 'admin', 'root', 'developer', 'user',
      'wayne' // Adding your username as an example
    ];
    
    const lowerProjectName = projectName.toLowerCase();
    
    if (
      genericNames.includes(lowerProjectName) ||
      userNames.includes(lowerProjectName)
    ) {
      // Try to find a meaningful project directory by going up the path
      const parentDirs = cwdPath.split(path.sep);
      for (let i = parentDirs.length - 2; i >= 0; i--) {
        const parentName = parentDirs[i]?.toLowerCase() || '';
        if (
          !genericNames.includes(parentName) &&
          !userNames.includes(parentName) &&
          parentName !== '' &&
          parentName !== (process.platform === 'win32' ? '' : '/')
        ) {
          const parentPath = parentDirs.slice(0, i + 1).join(path.sep);
          return {
            projectName: parentDirs[i] || '',
            projectPath: parentPath
          };
        }
      }
      
      // If we can't find a good project name, just use current dir
      return {
        projectName: 'Current Project',
        projectPath: cwdPath
      };
    }
    
    return {
      projectName,
      projectPath: cwdPath
    };
  } catch (error) {
    console.error('Error getting fallback project info', error);
    return {
      projectName: 'Unknown Project',
      projectPath: '/'
    };
  }
}