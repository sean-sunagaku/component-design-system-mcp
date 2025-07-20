import { ComponentCache } from '../cache/ComponentCache';
import { ConfigManager } from '../config/ConfigManager';
import { ComponentInfo } from '../types';

jest.mock('../config/ConfigManager');
const MockedConfigManager = ConfigManager as jest.MockedClass<typeof ConfigManager>;

describe('ComponentCache', () => {
  let cache: ComponentCache;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let sampleComponent: ComponentInfo;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfigManager = new MockedConfigManager() as jest.Mocked<ConfigManager>;
    mockConfigManager.getConfig.mockReturnValue({
      scanPaths: [],
      excludePatterns: [],
      frameworks: [],
      componentPatterns: [],
      cacheEnabled: true,
      autoRefresh: true,
      refreshInterval: 300
    });
    
    cache = new ComponentCache(mockConfigManager);
    
    sampleComponent = {
      name: 'Button',
      filePath: './src/Button.tsx',
      framework: 'react-native',
      props: [],
      styles: [],
      usageExamples: [],
      dependencies: [],
      category: 'ui',
      lastModified: new Date()
    };
  });

  describe('setComponent and getComponent', () => {
    it('should store and retrieve components when cache is enabled', () => {
      cache.setComponent(sampleComponent);
      const retrieved = cache.getComponent(sampleComponent.filePath);
      
      expect(retrieved).toEqual(sampleComponent);
    });

    it('should not store components when cache is disabled', () => {
      mockConfigManager.getConfig.mockReturnValue({
        scanPaths: [],
        excludePatterns: [],
        frameworks: [],
        componentPatterns: [],
        cacheEnabled: false,
        autoRefresh: true,
        refreshInterval: 300
      });
      
      cache.setComponent(sampleComponent);
      const retrieved = cache.getComponent(sampleComponent.filePath);
      
      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent components', () => {
      const retrieved = cache.getComponent('./non-existent.tsx');
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllComponents', () => {
    it('should return all cached components', () => {
      const component2 = { ...sampleComponent, name: 'Input', filePath: './src/Input.tsx' };
      
      cache.setComponent(sampleComponent);
      cache.setComponent(component2);
      
      const allComponents = cache.getAllComponents();
      
      expect(allComponents).toHaveLength(2);
      expect(allComponents).toContainEqual(sampleComponent);
      expect(allComponents).toContainEqual(component2);
    });

    it('should return empty array when cache is disabled', () => {
      mockConfigManager.getConfig.mockReturnValue({
        scanPaths: [],
        excludePatterns: [],
        frameworks: [],
        componentPatterns: [],
        cacheEnabled: false,
        autoRefresh: true,
        refreshInterval: 300
      });
      
      const allComponents = cache.getAllComponents();
      expect(allComponents).toEqual([]);
    });
  });

  describe('invalidateComponent', () => {
    it('should remove component from cache', () => {
      cache.setComponent(sampleComponent);
      cache.invalidateComponent(sampleComponent.filePath);
      
      const retrieved = cache.getComponent(sampleComponent.filePath);
      expect(retrieved).toBeNull();
    });
  });

  describe('invalidateAll', () => {
    it('should clear all components from cache', () => {
      cache.setComponent(sampleComponent);
      cache.invalidateAll();
      
      const allComponents = cache.getAllComponents();
      expect(allComponents).toEqual([]);
    });
  });

  describe('isValid', () => {
    it('should return true for valid cached component', () => {
      cache.setComponent(sampleComponent);
      
      const isValid = cache.isValid(sampleComponent.filePath, sampleComponent.lastModified);
      expect(isValid).toBe(true);
    });

    it('should return false for outdated cached component', () => {
      cache.setComponent(sampleComponent);
      
      const newerDate = new Date(sampleComponent.lastModified.getTime() + 1000);
      const isValid = cache.isValid(sampleComponent.filePath, newerDate);
      expect(isValid).toBe(false);
    });

    it('should return false for non-existent component', () => {
      const isValid = cache.isValid('./non-existent.tsx', new Date());
      expect(isValid).toBe(false);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      cache.setComponent(sampleComponent);
      cache.getComponent(sampleComponent.filePath); // Access to increase count
      
      const stats = cache.getCacheStats();
      
      expect(stats.size).toBe(1);
      expect(stats.maxSize).toBe(1000);
      expect(stats.totalAccesses).toBe(2); // 1 set + 1 get
    });
  });
});
