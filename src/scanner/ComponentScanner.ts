import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../config/ConfigManager.js';

export class ComponentScanner {
  constructor(private configManager: ConfigManager) {}

  public async scanForComponents(): Promise<string[]> {
    const config = this.configManager.getConfig();
    const componentFiles: string[] = [];

    for (const scanPath of config.scanPaths) {
      const resolvedPath = path.resolve(scanPath);
      if (fs.existsSync(resolvedPath)) {
        const files = await this.scanDirectory(resolvedPath);
        componentFiles.push(...files);
      }
    }

    return componentFiles.filter(file => this.configManager.isComponentFile(file));
  }

  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (!this.configManager.isFileIncluded(fullPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory ${dirPath}:`, error);
    }

    return files;
  }

  public isComponentFile(filePath: string): boolean {
    return this.configManager.isComponentFile(filePath);
  }

  public shouldExclude(filePath: string): boolean {
    return !this.configManager.isFileIncluded(filePath);
  }
}
