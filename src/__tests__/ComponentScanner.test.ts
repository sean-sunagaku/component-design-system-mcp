import { ComponentScanner } from '../scanner/ComponentScanner';
import { ConfigManager } from '../config/ConfigManager';
import * as fs from 'fs';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('../config/ConfigManager');
const MockedConfigManager = ConfigManager as jest.MockedClass<typeof ConfigManager>;

describe('ComponentScanner', () => {
  let scanner: ComponentScanner;
  let mockConfigManager: jest.Mocked<ConfigManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfigManager = new MockedConfigManager() as jest.Mocked<ConfigManager>;
    mockConfigManager.getConfig.mockReturnValue({
      scanPaths: ['./src'],
      excludePatterns: ['node_modules', '*.test.*'],
      frameworks: [],
      componentPatterns: ['**/*Component.{tsx,jsx}'],
      cacheEnabled: true,
      autoRefresh: true,
      refreshInterval: 300
    });
    
    scanner = new ComponentScanner(mockConfigManager);
  });

  describe('scanForComponents', () => {
    it('should scan directories and return component files', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockImplementation((dirPath: any) => {
        const pathStr = dirPath.toString();
        if (pathStr.includes('components/components')) {
          return [];
        }
        if (pathStr.endsWith('components')) {
          return [
            { name: 'Button.tsx', isDirectory: () => false, isFile: () => true }
          ] as any;
        }
        return [
          { name: 'Button.tsx', isDirectory: () => false, isFile: () => true },
          { name: 'components', isDirectory: () => true, isFile: () => false }
        ] as any;
      });

      mockConfigManager.isFileIncluded.mockReturnValue(true);
      mockConfigManager.isComponentFile.mockReturnValue(true);

      const result = await scanner.scanForComponents();
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(file => file.includes('Button.tsx'))).toBe(true);
      expect(mockedFs.readdirSync).toHaveBeenCalled();
    });

    it('should handle non-existent directories gracefully', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      const result = await scanner.scanForComponents();
      
      expect(result).toEqual([]);
    });

    it('should filter out excluded files', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        { name: 'Button.tsx', isDirectory: () => false, isFile: () => true },
        { name: 'Button.test.tsx', isDirectory: () => false, isFile: () => true }
      ] as any);

      mockConfigManager.isFileIncluded.mockReturnValue(true);
      mockConfigManager.isComponentFile.mockImplementation((filePath: string) => {
        return filePath.includes('Button.tsx') && !filePath.includes('.test.');
      });

      const result = await scanner.scanForComponents();
      
      expect(result.length).toBe(1);
      expect(result[0]).toContain('Button.tsx');
      expect(result[0]).not.toContain('.test.');
    });
  });

  describe('isComponentFile', () => {
    it('should delegate to ConfigManager', () => {
      const filePath = './src/Button.tsx';
      mockConfigManager.isComponentFile.mockReturnValue(true);
      
      const result = scanner.isComponentFile(filePath);
      
      expect(result).toBe(true);
      expect(mockConfigManager.isComponentFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('shouldExclude', () => {
    it('should return opposite of isFileIncluded', () => {
      const filePath = './src/Button.tsx';
      mockConfigManager.isFileIncluded.mockReturnValue(true);
      
      const result = scanner.shouldExclude(filePath);
      
      expect(result).toBe(false);
      expect(mockConfigManager.isFileIncluded).toHaveBeenCalledWith(filePath);
    });
  });
});
