import { MCPServer } from '../core/MCPServer';
import { ConfigManager } from '../config/ConfigManager';
import { ComponentScanner } from '../scanner/ComponentScanner';
import { ComponentAnalyzer } from '../analyzer/ComponentAnalyzer';
import { SimilarityAnalyzer } from '../analyzer/SimilarityAnalyzer';
import { DesignSystemAnalyzer } from '../analyzer/DesignSystemAnalyzer';
import { ComponentCache } from '../cache/ComponentCache';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { ErrorHandler } from '../utils/ErrorHandler';
import path from 'path';

describe('MCP Server Integration Tests', () => {
  let mcpServer: MCPServer;
  let configManager: ConfigManager;
  let componentScanner: ComponentScanner;
  let componentAnalyzer: ComponentAnalyzer;
  let similarityAnalyzer: SimilarityAnalyzer;
  let designSystemAnalyzer: DesignSystemAnalyzer;
  let componentCache: ComponentCache;
  let performanceMonitor: PerformanceMonitor;
  let errorHandler: ErrorHandler;

  beforeAll(async () => {
    const testConfigPath = path.join(__dirname, 'test-config.json');
    const testConfig = {
      scanPaths: [path.join(__dirname, 'sample-components')],
      excludePatterns: ['node_modules', 'dist', '*.test.ts'],
      frameworks: [
        {
          name: 'react-native' as const,
          enabled: true,
          fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
          componentPatterns: ['*Button.tsx', '*Card.tsx'],
          stylePatterns: ['StyleSheet.create', 'styles =']
        },
        {
          name: 'tailwind' as const,
          enabled: true,
          fileExtensions: ['.tsx', '.jsx'],
          componentPatterns: ['className=', 'class='],
          stylePatterns: ['className=', 'bg-', 'text-']
        }
      ],
      componentPatterns: ['**/*.tsx', '**/*.ts'],
      cacheEnabled: false,
      autoRefresh: false,
      refreshInterval: 300
    };
    
    require('fs').writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
    
    configManager = new ConfigManager(testConfigPath);
    
    componentCache = new ComponentCache(configManager);
    componentScanner = new ComponentScanner(configManager);
    componentAnalyzer = new ComponentAnalyzer(configManager);
    similarityAnalyzer = new SimilarityAnalyzer();
    designSystemAnalyzer = new DesignSystemAnalyzer();
    performanceMonitor = new PerformanceMonitor();
    errorHandler = new ErrorHandler();
    
    mcpServer = new MCPServer(testConfigPath);
  });

  describe('Component Discovery', () => {
    it('should scan and find sample component files', async () => {
      const filePaths = await componentScanner.scanForComponents();
      
      expect(filePaths).toBeDefined();
      expect(Array.isArray(filePaths)).toBe(true);
      expect(filePaths.length).toBeGreaterThan(0);
      
      const hasButtonFile = filePaths.some(path => path.includes('ReactNativeButton.tsx'));
      const hasCardFile = filePaths.some(path => path.includes('TailwindCard.tsx'));
      expect(hasButtonFile).toBe(true);
      expect(hasCardFile).toBe(true);
    });

    it('should extract component details through MCP server', async () => {
      const components = await (mcpServer as any).getAllComponents();
      
      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
      
      const buttonComponent = components.find((c: any) => c.name === 'ReactNativeButton');
      expect(buttonComponent).toBeDefined();
      expect(buttonComponent.filePath).toContain('ReactNativeButton.tsx');
      
      expect(buttonComponent.props).toBeDefined();
      expect(buttonComponent.props.length).toBeGreaterThan(0);
      
      const titleProp = buttonComponent.props.find((p: any) => p.name === 'title');
      expect(titleProp).toBeDefined();
      expect(titleProp.type).toBe('string');
      expect(titleProp.required).toBe(true);
    });
  });

  describe('Style Analysis', () => {
    it('should extract React Native StyleSheet styles', async () => {
      const components = await (mcpServer as any).getAllComponents();
      const buttonComponent = components.find((c: any) => c.name === 'ReactNativeButton');
      
      expect(buttonComponent).toBeDefined();
      expect(buttonComponent.styles).toBeDefined();
      expect(buttonComponent.styles.length).toBeGreaterThan(0);
      
      const buttonStyle = buttonComponent.styles.find((s: any) => s.name === 'button');
      expect(buttonStyle).toBeDefined();
      expect(buttonStyle.property).toBeDefined();
      
      const hasExpectedProps = buttonComponent.styles.some((s: any) => 
        s.property === 'borderRadius' || s.property === 'alignItems'
      );
      expect(hasExpectedProps).toBe(true);
    });

    it('should extract Tailwind CSS classes', async () => {
      const components = await (mcpServer as any).getAllComponents();
      const cardComponent = components.find((c: any) => c.name === 'TailwindCard');
      
      expect(cardComponent).toBeDefined();
      expect(cardComponent.framework).toBe('tailwind');
      expect(cardComponent.styles).toBeDefined();
      expect(cardComponent.styles.length).toBeGreaterThan(0);
      
      const styles = cardComponent.styles;
      const hasBackgroundClasses = styles.some((s: any) => 
        s.value && (s.value.includes('bg-white') || s.value.includes('bg-gray-50'))
      );
      expect(hasBackgroundClasses).toBe(true);
    });
  });

  describe('Similarity Analysis', () => {
    it('should find similar components through MCP server', async () => {
      const similar = await (mcpServer as any).findSimilarComponents('ReactNativeButton', 0.3);
      
      expect(Array.isArray(similar)).toBe(true);
      expect(similar.length).toBeGreaterThanOrEqual(1);
      
      const foundButton = similar.find((c: any) => c.component.name === 'ReactNativeButton');
      expect(foundButton).toBeDefined();
      expect(foundButton.similarity).toBeGreaterThan(0);
    });
  });

  describe('Design System Analysis', () => {
    it('should extract design system information through MCP server', async () => {
      const designSystem = await (mcpServer as any).getDesignSystem();
      
      expect(designSystem).toBeDefined();
      expect(designSystem.colors).toBeDefined();
      expect(designSystem.typography).toBeDefined();
      expect(designSystem.spacing).toBeDefined();
      
      expect(Object.keys(designSystem.colors).length).toBeGreaterThan(0);
      
      const colorValues = Object.values(designSystem.colors);
      const hasBlueColor = colorValues.some((colorCategory: any) => {
        if (Array.isArray(colorCategory)) {
          return colorCategory.some((color: any) => 
            color.value && (color.value.includes('#007AFF') || color.value.includes('blue'))
          );
        }
        if (typeof colorCategory === 'string') {
          return colorCategory.includes('#007AFF') || colorCategory.includes('blue');
        }
        return false;
      });
      expect(hasBlueColor).toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics through MCP server', async () => {
      await (mcpServer as any).getAllComponents();
      
      const metrics = await (mcpServer as any).getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.scanTime).toBe('number');
      expect(typeof metrics.analysisTime).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(metrics.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle and log errors appropriately', () => {
      const testError = new Error('Test error');
      const context = {
        operation: 'test_operation',
        filePath: '/test/path',
        timestamp: new Date()
      };
      
      expect(() => {
        errorHandler.handleError(testError, context, 'medium');
      }).not.toThrow();
      
      const errors = errorHandler.getErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].error.message).toBe('Test error');
    });
  });

  describe('End-to-End MCP Tools', () => {
    it('should provide working getAllComponents method', async () => {
      const result = await (mcpServer as any).getAllComponents();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const componentNames = result.map((c: any) => c.name);
      expect(componentNames).toContain('ReactNativeButton');
      expect(componentNames).toContain('TailwindCard');
    });

    it('should provide working getComponentDetails method', async () => {
      const allComponents = await (mcpServer as any).getAllComponents();
      const buttonComponent = allComponents.find((c: any) => c.name === 'ReactNativeButton');
      
      expect(buttonComponent).toBeDefined();
      
      const details = await (mcpServer as any).getComponentDetails(buttonComponent.name);
      
      expect(details).toBeDefined();
      expect(details.name).toBe('ReactNativeButton');
      expect(details.props).toBeDefined();
      expect(details.styles).toBeDefined();
      expect(details.framework).toBe('react-native');
    });

    it('should provide working findSimilarComponents method', async () => {
      const similar = await (mcpServer as any).findSimilarComponents('ReactNativeButton', 0.3);
      
      expect(Array.isArray(similar)).toBe(true);
      expect(similar.length).toBeGreaterThanOrEqual(1);
      
      const foundButton = similar.find((c: any) => c.component.name === 'ReactNativeButton');
      expect(foundButton).toBeDefined();
    });

    it('should provide working getDesignSystem method', async () => {
      const designSystem = await (mcpServer as any).getDesignSystem();
      
      expect(designSystem).toBeDefined();
      expect(designSystem.colors).toBeDefined();
      expect(designSystem.typography).toBeDefined();
      expect(designSystem.spacing).toBeDefined();
      expect(typeof designSystem.colors).toBe('object');
    });

    it('should provide working getPerformanceMetrics method', async () => {
      const metrics = await (mcpServer as any).getPerformanceMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.scanTime).toBe('number');
      expect(typeof metrics.analysisTime).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
    });

    it('should provide working getErrorReport method', async () => {
      const errorHandler = (mcpServer as any).errorHandler;
      errorHandler.handleError(
        new Error('Test integration error'),
        { operation: 'integration_test', timestamp: new Date() },
        'low'
      );
      
      const errorReport = await (mcpServer as any).getErrorReport();
      
      expect(errorReport).toBeDefined();
      expect(typeof errorReport.total).toBe('number');
      expect(typeof errorReport.low).toBe('number');
      expect(typeof errorReport.medium).toBe('number');
      expect(typeof errorReport.high).toBe('number');
      expect(typeof errorReport.critical).toBe('number');
    });
  });
});
