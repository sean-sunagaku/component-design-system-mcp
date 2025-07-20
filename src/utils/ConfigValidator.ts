import { Config, FrameworkConfig } from '../types/index.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigValidator {
  public validateConfig(config: Config): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    this.validateScanPaths(config.scanPaths, result);
    this.validateExcludePatterns(config.excludePatterns, result);
    this.validateFrameworks(config.frameworks, result);
    this.validateComponentPatterns(config.componentPatterns, result);
    this.validateCacheSettings(config, result);

    result.valid = result.errors.length === 0;
    return result;
  }

  private validateScanPaths(scanPaths: string[], result: ValidationResult): void {
    if (!Array.isArray(scanPaths) || scanPaths.length === 0) {
      result.errors.push('scanPaths must be a non-empty array');
      return;
    }

    for (const scanPath of scanPaths) {
      if (typeof scanPath !== 'string') {
        result.errors.push(`scanPath must be a string: ${scanPath}`);
        continue;
      }

      const resolvedPath = path.resolve(scanPath);
      if (!fs.existsSync(resolvedPath)) {
        result.warnings.push(`Scan path does not exist: ${scanPath}`);
      } else if (!fs.statSync(resolvedPath).isDirectory()) {
        result.errors.push(`Scan path is not a directory: ${scanPath}`);
      }
    }
  }

  private validateExcludePatterns(excludePatterns: string[], result: ValidationResult): void {
    if (!Array.isArray(excludePatterns)) {
      result.errors.push('excludePatterns must be an array');
      return;
    }

    for (const pattern of excludePatterns) {
      if (typeof pattern !== 'string') {
        result.errors.push(`excludePattern must be a string: ${pattern}`);
      }
    }
  }

  private validateFrameworks(frameworks: FrameworkConfig[], result: ValidationResult): void {
    if (!Array.isArray(frameworks) || frameworks.length === 0) {
      result.errors.push('frameworks must be a non-empty array');
      return;
    }

    const enabledFrameworks = frameworks.filter(fw => fw.enabled);
    if (enabledFrameworks.length === 0) {
      result.warnings.push('No frameworks are enabled');
    }

    for (const framework of frameworks) {
      this.validateFramework(framework, result);
    }
  }

  private validateFramework(framework: FrameworkConfig, result: ValidationResult): void {
    if (!framework.name || typeof framework.name !== 'string') {
      result.errors.push('Framework name is required and must be a string');
    }

    if (typeof framework.enabled !== 'boolean') {
      result.errors.push(`Framework enabled must be a boolean: ${framework.name}`);
    }

    if (!Array.isArray(framework.fileExtensions) || framework.fileExtensions.length === 0) {
      result.errors.push(`Framework fileExtensions must be a non-empty array: ${framework.name}`);
    }

    if (!Array.isArray(framework.componentPatterns)) {
      result.errors.push(`Framework componentPatterns must be an array: ${framework.name}`);
    }

    if (!Array.isArray(framework.stylePatterns)) {
      result.errors.push(`Framework stylePatterns must be an array: ${framework.name}`);
    }
  }

  private validateComponentPatterns(componentPatterns: string[], result: ValidationResult): void {
    if (!Array.isArray(componentPatterns) || componentPatterns.length === 0) {
      result.errors.push('componentPatterns must be a non-empty array');
      return;
    }

    for (const pattern of componentPatterns) {
      if (typeof pattern !== 'string') {
        result.errors.push(`componentPattern must be a string: ${pattern}`);
      }
    }
  }

  private validateCacheSettings(config: Config, result: ValidationResult): void {
    if (typeof config.cacheEnabled !== 'boolean') {
      result.errors.push('cacheEnabled must be a boolean');
    }

    if (typeof config.autoRefresh !== 'boolean') {
      result.errors.push('autoRefresh must be a boolean');
    }

    if (typeof config.refreshInterval !== 'number' || config.refreshInterval < 0) {
      result.errors.push('refreshInterval must be a non-negative number');
    }

    if (config.refreshInterval < 60 && config.autoRefresh) {
      result.warnings.push('refreshInterval less than 60 seconds may impact performance');
    }
  }

  public validateEnvironment(): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (typeof process === 'undefined') {
      result.errors.push('Node.js environment required');
      return result;
    }

    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      result.errors.push(`Node.js 16+ required, found ${nodeVersion}`);
    }

    try {
      require.resolve('typescript');
    } catch {
      result.warnings.push('TypeScript not found in dependencies');
    }

    result.valid = result.errors.length === 0;
    return result;
  }
}
