import { ConfigManager } from '../config/ConfigManager';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const testConfigPath = '/test/config.json';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(false);
  });

  describe('constructor', () => {
    it('should load default config when no config file exists', () => {
      mockedFs.existsSync.mockReturnValue(false);
      
      configManager = new ConfigManager(testConfigPath);
      const config = configManager.getConfig();
      
      expect(config.scanPaths).toEqual(['./src', './components', './screens']);
      expect(config.frameworks).toHaveLength(2);
      expect(config.cacheEnabled).toBe(true);
    });

    it('should load user config when config file exists', () => {
      const userConfig = {
        scanPaths: ['./custom'],
        cacheEnabled: false
      };
      
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(userConfig));
      
      configManager = new ConfigManager(testConfigPath);
      const config = configManager.getConfig();
      
      expect(config.scanPaths).toEqual(['./custom']);
      expect(config.cacheEnabled).toBe(false);
      expect(config.frameworks).toHaveLength(2); // Should merge with defaults
    });
  });

  describe('isFileIncluded', () => {
    beforeEach(() => {
      configManager = new ConfigManager(testConfigPath);
    });

    it('should include files in scan paths', () => {
      const result = configManager.isFileIncluded('./src/components/Button.tsx');
      expect(result).toBe(true);
    });

    it('should exclude files matching exclude patterns', () => {
      const result = configManager.isFileIncluded('./src/components/Button.test.tsx');
      expect(result).toBe(false);
    });

    it('should exclude node_modules', () => {
      const result = configManager.isFileIncluded('./node_modules/react/index.js');
      expect(result).toBe(false);
    });
  });

  describe('isComponentFile', () => {
    beforeEach(() => {
      configManager = new ConfigManager(testConfigPath);
    });

    it('should identify React component files', () => {
      const result = configManager.isComponentFile('./src/components/Button.tsx');
      expect(result).toBe(true);
    });

    it('should identify React Native screen files', () => {
      const result = configManager.isComponentFile('./src/screens/LoginScreen.tsx');
      expect(result).toBe(true);
    });

    it('should reject non-component files', () => {
      const result = configManager.isComponentFile('./src/utils/helper.ts');
      expect(result).toBe(false);
    });
  });

  describe('getFrameworkConfig', () => {
    beforeEach(() => {
      configManager = new ConfigManager(testConfigPath);
    });

    it('should return framework config for enabled frameworks', () => {
      const reactNativeConfig = configManager.getFrameworkConfig('react-native');
      expect(reactNativeConfig).toBeDefined();
      expect(reactNativeConfig?.name).toBe('react-native');
      expect(reactNativeConfig?.enabled).toBe(true);
    });

    it('should return undefined for disabled frameworks', () => {
      configManager.updateConfig({
        frameworks: [{
          name: 'react-native',
          enabled: false,
          fileExtensions: ['.tsx'],
          componentPatterns: [],
          stylePatterns: []
        }]
      });
      
      const reactNativeConfig = configManager.getFrameworkConfig('react-native');
      expect(reactNativeConfig).toBeUndefined();
    });
  });
});
