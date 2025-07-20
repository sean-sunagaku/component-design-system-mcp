import * as fs from 'fs';
import * as path from 'path';
import { Config, FrameworkConfig } from '../types';

export class ConfigManager {
  private config: Config;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), 'component-mcp.config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf-8');
        const userConfig = JSON.parse(configData);
        return this.mergeWithDefaults(userConfig);
      }
    } catch (error) {
      console.warn(`Failed to load config from ${this.configPath}:`, error);
    }
    
    return this.getDefaultConfig();
  }

  private getDefaultConfig(): Config {
    return {
      scanPaths: ['./src', './components', './screens'],
      excludePatterns: [
        'node_modules',
        '*.test.*',
        '*.spec.*',
        '__tests__',
        'dist',
        'build',
        '.git'
      ],
      frameworks: [
        {
          name: 'react-native',
          enabled: true,
          fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
          componentPatterns: ['*Screen.tsx', '*Component.tsx', '*Screen.jsx', '*Component.jsx'],
          stylePatterns: ['StyleSheet.create', 'styled-components', 'style=']
        },
        {
          name: 'tailwind',
          enabled: true,
          fileExtensions: ['.tsx', '.jsx', '.html', '.vue'],
          componentPatterns: ['className=', 'class='],
          stylePatterns: ['@apply', 'tailwind.config.*', 'className=']
        }
      ],
      componentPatterns: [
        '**/*Component.{tsx,jsx,ts,js}',
        '**/*Screen.{tsx,jsx,ts,js}',
        '**/components/*.{tsx,jsx,ts,js}',
        '**/screens/*.{tsx,jsx,ts,js}'
      ],
      cacheEnabled: true,
      autoRefresh: true,
      refreshInterval: 300
    };
  }

  private mergeWithDefaults(userConfig: Partial<Config>): Config {
    const defaultConfig = this.getDefaultConfig();
    
    return {
      ...defaultConfig,
      ...userConfig,
      frameworks: userConfig.frameworks 
        ? userConfig.frameworks.map(fw => ({
            ...defaultConfig.frameworks.find(df => df.name === fw.name) || {},
            ...fw
          }))
        : defaultConfig.frameworks
    };
  }

  public getConfig(): Config {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<Config>): void {
    this.config = this.mergeWithDefaults({ ...this.config, ...updates });
  }

  public saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(`Failed to save config to ${this.configPath}:`, error);
    }
  }

  public getFrameworkConfig(frameworkName: string): FrameworkConfig | undefined {
    return this.config.frameworks.find(fw => fw.name === frameworkName && fw.enabled);
  }

  public isFileIncluded(filePath: string): boolean {
    const normalizedFilePath = path.resolve(filePath).replace(/\\/g, '/');
    
    const inScanPath = this.config.scanPaths.some(scanPath => {
      const normalizedScanPath = path.resolve(scanPath).replace(/\\/g, '/');
      return normalizedFilePath.startsWith(normalizedScanPath);
    });

    if (!inScanPath) return false;

    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const isExcluded = this.config.excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');
        const regex = new RegExp(regexPattern);
        return regex.test(fileName) || regex.test(relativePath);
      }
      return relativePath.includes(pattern) || fileName.includes(pattern);
    });

    return !isExcluded;
  }

  public isComponentFile(filePath: string): boolean {
    if (!this.isFileIncluded(filePath)) return false;

    const fileName = path.basename(filePath);
    const extension = path.extname(filePath);
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

    const supportedByFramework = this.config.frameworks.some(fw => 
      fw.enabled && fw.fileExtensions.includes(extension)
    );

    if (!supportedByFramework) return false;

    return this.config.componentPatterns.some(pattern => {
      return this.matchesGlobPattern(relativePath, fileName, pattern);
    });
  }

  private matchesGlobPattern(relativePath: string, fileName: string, pattern: string): boolean {
    const testPath = relativePath.startsWith('./') ? relativePath.substring(2) : relativePath;
    
    if (pattern.includes('{') && pattern.includes('}')) {
      const braceMatch = pattern.match(/\{([^}]+)\}/);
      if (braceMatch) {
        const extensions = braceMatch[1].split(',');
        const basePattern = pattern.replace(/\{[^}]+\}/, '');
        
        return extensions.some(ext => {
          const expandedPattern = basePattern + ext.trim();
          return this.matchesSimpleGlobPattern(testPath, fileName, expandedPattern);
        });
      }
    }
    
    return this.matchesSimpleGlobPattern(testPath, fileName, pattern);
  }

  private matchesSimpleGlobPattern(testPath: string, fileName: string, pattern: string): boolean {
    let regexPattern = pattern;
    
    regexPattern = regexPattern.replace(/\./g, '\\.');
    
    regexPattern = regexPattern.replace(/\*\*/g, '__DOUBLE_STAR__');
    
    regexPattern = regexPattern.replace(/\*/g, '[^/]*');
    
    regexPattern = regexPattern.replace(/__DOUBLE_STAR__/g, '.*');
    
    regexPattern = '^' + regexPattern + '$';
    
    const regex = new RegExp(regexPattern);
    
    const pathMatch = regex.test(testPath);
    const fileMatch = regex.test(fileName);
    
    return pathMatch || fileMatch;
  }

}
