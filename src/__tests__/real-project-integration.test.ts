import { MCPServer } from '../core/MCPServer';
import { ConfigManager } from '../config/ConfigManager';
import path from 'path';
import fs from 'fs';

describe('Real Project Integration Tests', () => {
  let nextjsMcpServer: MCPServer;
  let reactNativeMcpServer: MCPServer;
  let nextjsConfigPath: string;
  let reactNativeConfigPath: string;

  beforeAll(async () => {
    // Setup NextJS + TailwindCSS test configuration
    nextjsConfigPath = path.join(__dirname, 'nextjs-test-config.json');
    const nextjsConfig = {
      scanPaths: [path.join(__dirname, '../../samples/nextjs-tailwind')],
      excludePatterns: ['node_modules', 'dist', '*.test.ts', '.next'],
      frameworks: [
        {
          name: 'tailwind' as const,
          enabled: true,
          fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
          componentPatterns: ['components/**/*.tsx', 'components/**/*.jsx'],
          stylePatterns: ['className=', 'bg-', 'text-', 'px-', 'py-', 'rounded-']
        }
      ],
      componentPatterns: ['**/*.tsx', '**/*.jsx'],
      cacheEnabled: false,
      autoRefresh: false,
      refreshInterval: 300
    };
    
    // Setup React Native test configuration
    reactNativeConfigPath = path.join(__dirname, 'react-native-test-config.json');
    const reactNativeConfig = {
      scanPaths: [path.join(__dirname, '../../samples/react-native')],
      excludePatterns: ['node_modules', 'dist', '*.test.ts', 'ios', 'android'],
      frameworks: [
        {
          name: 'react-native' as const,
          enabled: true,
          fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
          componentPatterns: ['src/components/**/*.tsx', 'src/components/**/*.jsx'],
          stylePatterns: ['StyleSheet.create', 'styles =', 'style=']
        }
      ],
      componentPatterns: ['**/*.tsx', '**/*.jsx'],
      cacheEnabled: false,
      autoRefresh: false,
      refreshInterval: 300
    };
    
    // Write config files
    fs.writeFileSync(nextjsConfigPath, JSON.stringify(nextjsConfig, null, 2));
    fs.writeFileSync(reactNativeConfigPath, JSON.stringify(reactNativeConfig, null, 2));
    
    // Initialize MCP servers
    nextjsMcpServer = new MCPServer(nextjsConfigPath);
    reactNativeMcpServer = new MCPServer(reactNativeConfigPath);
  });

  afterAll(() => {
    // Cleanup config files
    if (fs.existsSync(nextjsConfigPath)) {
      fs.unlinkSync(nextjsConfigPath);
    }
    if (fs.existsSync(reactNativeConfigPath)) {
      fs.unlinkSync(reactNativeConfigPath);
    }
  });

  describe('NextJS + TailwindCSS Project Analysis', () => {
    it('should discover all NextJS components', async () => {
      const components = await (nextjsMcpServer as any).getAllComponents();
      
      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
      
      // Check for expected components
      const componentNames = components.map((c: any) => c.name);
      expect(componentNames).toContain('Button');
      expect(componentNames).toContain('Card');
      expect(componentNames).toContain('Input');
      expect(componentNames).toContain('Modal');
      expect(componentNames).toContain('List');
      expect(componentNames).toContain('Header');
    });

    it('should correctly analyze Button component props and TailwindCSS styles', async () => {
      const components = await (nextjsMcpServer as any).getAllComponents();
      const buttonComponent = components.find((c: any) => c.name === 'Button');
      
      expect(buttonComponent).toBeDefined();
      expect(buttonComponent.framework).toBe('tailwind');
      expect(buttonComponent.filePath).toContain('Button.tsx');
      
      // Check props analysis
      expect(buttonComponent.props).toBeDefined();
      expect(buttonComponent.props.length).toBeGreaterThan(0);
      
      const childrenProp = buttonComponent.props.find((p: any) => p.name === 'children');
      expect(childrenProp).toBeDefined();
      expect(childrenProp.type).toContain('ReactNode');
      
      const variantProp = buttonComponent.props.find((p: any) => p.name === 'variant');
      expect(variantProp).toBeDefined();
      expect(variantProp.type).toContain('primary');
      
      // Check TailwindCSS style analysis
      expect(buttonComponent.styles).toBeDefined();
      expect(buttonComponent.styles.length).toBeGreaterThan(0);
      
      // Check for TailwindCSS class names (individual utility classes)
      const hasCommonTailwindClasses = buttonComponent.styles.some((s: any) => 
        s.value && (s.value.includes('animate-') || s.value.includes('text-') || s.value.includes('opacity-'))
      );
      expect(hasCommonTailwindClasses).toBe(true);
      
      // Should have detected className properties
      const hasClassNameProps = buttonComponent.styles.some((s: any) => 
        s.property === 'className'
      );
      expect(hasClassNameProps).toBe(true);
    });

    it('should extract comprehensive design system from TailwindCSS', async () => {
      const designSystem = await (nextjsMcpServer as any).getDesignSystem();
      
      expect(designSystem).toBeDefined();
      expect(designSystem.colors).toBeDefined();
      expect(designSystem.typography).toBeDefined();
      expect(designSystem.spacing).toBeDefined();
      
      // Check color system extraction
      expect(Object.keys(designSystem.colors).length).toBeGreaterThan(0);
      
      // Should extract colors from component usage (even if not custom config colors)
      const colorValues = Object.values(designSystem.colors);
      const hasAnyColors = colorValues.some((colorCategory: any) => {
        if (Array.isArray(colorCategory)) {
          return colorCategory.length > 0;
        }
        return false;
      });
      expect(hasAnyColors).toBe(true);
      
      // Check spacing system
      expect(Object.keys(designSystem.spacing).length).toBeGreaterThan(0);
      
      // Check typography system
      expect(Object.keys(designSystem.typography).length).toBeGreaterThan(0);
    });

    it('should find similar components within TailwindCSS project', async () => {
      const similar = await (nextjsMcpServer as any).findSimilarComponents('Button', 0.3);
      
      expect(Array.isArray(similar)).toBe(true);
      expect(similar.length).toBeGreaterThan(0);
      
      // Should find itself
      const selfMatch = similar.find((s: any) => s.component.name === 'Button');
      expect(selfMatch).toBeDefined();
      expect(selfMatch.similarity).toBeGreaterThan(0.9);
      
      // Should find other interactive components as similar
      const hasOtherComponents = similar.some((s: any) => 
        s.component.name !== 'Button' && s.similarity > 0.3
      );
      expect(hasOtherComponents).toBe(true);
    });

    it('should categorize components correctly', async () => {
      const categoriesResult = await (nextjsMcpServer as any).handleGetAvailableCategories({});
      const categories = JSON.parse(categoriesResult.content[0].text);
      
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Should detect UI and layout categories (check name field)
      const categoryNames = categories.map((c: any) => c.name);
      expect(categoryNames.some((name: string) => name.includes('ui') || name.includes('layout'))).toBe(true);
    });
  });

  describe('React Native Project Analysis', () => {
    it('should discover all React Native components', async () => {
      const components = await (reactNativeMcpServer as any).getAllComponents();
      
      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
      
      // Check for expected components
      const componentNames = components.map((c: any) => c.name);
      expect(componentNames).toContain('Button');
      expect(componentNames).toContain('Card');
      expect(componentNames).toContain('Input');
      expect(componentNames).toContain('Modal');
      expect(componentNames).toContain('List');
      expect(componentNames).toContain('Header');
    });

    it('should correctly analyze React Native Button component with StyleSheet', async () => {
      const components = await (reactNativeMcpServer as any).getAllComponents();
      const buttonComponent = components.find((c: any) => c.name === 'Button');
      
      expect(buttonComponent).toBeDefined();
      expect(buttonComponent.framework).toBe('react-native');
      expect(buttonComponent.filePath).toContain('Button.tsx');
      
      // Check props analysis
      expect(buttonComponent.props).toBeDefined();
      expect(buttonComponent.props.length).toBeGreaterThan(0);
      
      const titleProp = buttonComponent.props.find((p: any) => p.name === 'title');
      expect(titleProp).toBeDefined();
      expect(titleProp.type).toBe('string');
      expect(titleProp.required).toBe(true);
      
      const variantProp = buttonComponent.props.find((p: any) => p.name === 'variant');
      expect(variantProp).toBeDefined();
      
      // Check StyleSheet analysis
      expect(buttonComponent.styles).toBeDefined();
      expect(buttonComponent.styles.length).toBeGreaterThan(0);
      
      const hasBorderRadius = buttonComponent.styles.some((s: any) => 
        s.property === 'borderRadius'
      );
      expect(hasBorderRadius).toBe(true);
      
      const hasPrimaryBackground = buttonComponent.styles.some((s: any) => 
        s.property === 'backgroundColor' && s.value && s.value.includes('#007AFF')
      );
      expect(hasPrimaryBackground).toBe(true);
    });

    it('should extract design tokens from React Native StyleSheet', async () => {
      const designSystem = await (reactNativeMcpServer as any).getDesignSystem();
      
      expect(designSystem).toBeDefined();
      expect(designSystem.colors).toBeDefined();
      expect(designSystem.typography).toBeDefined();
      expect(designSystem.spacing).toBeDefined();
      
      // Check for iOS system colors extraction
      const colorValues = Object.values(designSystem.colors);
      const hasIOSBlue = colorValues.some((colorCategory: any) => {
        if (Array.isArray(colorCategory)) {
          return colorCategory.some((color: any) => 
            color.value && color.value.includes('#007AFF')
          );
        }
        if (typeof colorCategory === 'string') {
          return colorCategory.includes('#007AFF');
        }
        return false;
      });
      expect(hasIOSBlue).toBe(true);
      
      // Check spacing extraction from padding/margin values
      expect(Object.keys(designSystem.spacing).length).toBeGreaterThan(0);
    });

    it('should detect TouchableOpacity and other React Native patterns', async () => {
      const components = await (reactNativeMcpServer as any).getAllComponents();
      
      // Check for React Native specific patterns
      const hasInteractiveComponents = components.some((c: any) => 
        c.filePath.includes('Button.tsx') || c.filePath.includes('List.tsx')
      );
      expect(hasInteractiveComponents).toBe(true);
      
      // Verify React Native component structure is detected
      const buttonComponent = components.find((c: any) => c.name === 'Button');
      expect(buttonComponent).toBeDefined();
      
      // Verify it's correctly identified as React Native framework
      expect(buttonComponent.framework).toBe('react-native');
      
      // Should have proper StyleSheet styles
      expect(buttonComponent.styles.length).toBeGreaterThan(10);
    });
  });

  describe('Cross-Platform Comparison', () => {
    it('should identify similar components across frameworks', async () => {
      const nextjsComponents = await (nextjsMcpServer as any).getAllComponents();
      const rnComponents = await (reactNativeMcpServer as any).getAllComponents();
      
      const nextjsButton = nextjsComponents.find((c: any) => c.name === 'Button');
      const rnButton = rnComponents.find((c: any) => c.name === 'Button');
      
      expect(nextjsButton).toBeDefined();
      expect(rnButton).toBeDefined();
      
      // Both should have similar prop structures
      const nextjsProps = nextjsButton.props.map((p: any) => p.name);
      const rnProps = rnButton.props.map((p: any) => p.name);
      
      const commonProps = nextjsProps.filter((prop: string) => rnProps.includes(prop));
      expect(commonProps.length).toBeGreaterThan(3); // title, variant, size, disabled, etc.
      
      // Both should have style information
      expect(nextjsButton.styles.length).toBeGreaterThan(0);
      expect(rnButton.styles.length).toBeGreaterThan(0);
    });

    it('should extract different but comparable design systems', async () => {
      const nextjsDesignSystem = await (nextjsMcpServer as any).getDesignSystem();
      const rnDesignSystem = await (reactNativeMcpServer as any).getDesignSystem();
      
      // Both should have color systems
      expect(Object.keys(nextjsDesignSystem.colors).length).toBeGreaterThan(0);
      expect(Object.keys(rnDesignSystem.colors).length).toBeGreaterThan(0);
      
      // Both should have spacing systems
      expect(Object.keys(nextjsDesignSystem.spacing).length).toBeGreaterThan(0);
      expect(Object.keys(rnDesignSystem.spacing).length).toBeGreaterThan(0);
      
      // TailwindCSS should have more comprehensive typography
      expect(Object.keys(nextjsDesignSystem.typography).length).toBeGreaterThanOrEqual(
        Object.keys(rnDesignSystem.typography).length
      );
    });
  });

  describe('Performance and Error Handling', () => {
    it('should complete analysis within reasonable time for NextJS project', async () => {
      const startTime = Date.now();
      await (nextjsMcpServer as any).getAllComponents();
      const endTime = Date.now();
      
      const analysisTime = endTime - startTime;
      expect(analysisTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should complete analysis within reasonable time for React Native project', async () => {
      const startTime = Date.now();
      await (reactNativeMcpServer as any).getAllComponents();
      const endTime = Date.now();
      
      const analysisTime = endTime - startTime;
      expect(analysisTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle errors gracefully for both projects', async () => {
      const nextjsErrorReport = await (nextjsMcpServer as any).getErrorReport();
      const rnErrorReport = await (reactNativeMcpServer as any).getErrorReport();
      
      expect(nextjsErrorReport).toBeDefined();
      expect(rnErrorReport).toBeDefined();
      
      // Should not have critical errors
      expect(nextjsErrorReport.critical).toBe(0);
      expect(rnErrorReport.critical).toBe(0);
      
      // High errors should be minimal
      expect(nextjsErrorReport.high).toBeLessThanOrEqual(2);
      expect(rnErrorReport.high).toBeLessThanOrEqual(2);
    });

    it('should provide performance metrics for both projects', async () => {
      const nextjsMetrics = await (nextjsMcpServer as any).getPerformanceMetrics();
      const rnMetrics = await (reactNativeMcpServer as any).getPerformanceMetrics();
      
      expect(nextjsMetrics).toBeDefined();
      expect(rnMetrics).toBeDefined();
      
      // Should have valid timing metrics
      expect(typeof nextjsMetrics.scanTime).toBe('number');
      expect(typeof nextjsMetrics.analysisTime).toBe('number');
      expect(typeof rnMetrics.scanTime).toBe('number');
      expect(typeof rnMetrics.analysisTime).toBe('number');
      
      // Memory usage should be reasonable
      expect(nextjsMetrics.memoryUsage).toBeGreaterThan(0);
      expect(rnMetrics.memoryUsage).toBeGreaterThan(0);
      expect(nextjsMetrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
      expect(rnMetrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });
  });
});