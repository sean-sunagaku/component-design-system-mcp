import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { ComponentScanner } from '../scanner/ComponentScanner.js';
import { ComponentAnalyzer } from '../analyzer/ComponentAnalyzer.js';
import { ComponentCache } from '../cache/ComponentCache.js';
import { SimilarityAnalyzer } from '../analyzer/SimilarityAnalyzer.js';
import { DesignSystemAnalyzer } from '../analyzer/DesignSystemAnalyzer.js';
import { CategoryDetector } from '../analyzer/CategoryDetector.js';
import { AdvancedCache } from '../cache/AdvancedCache.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ConfigValidator } from '../utils/ConfigValidator.js';
import { ComponentInfo, ComponentSummary, ComponentMatch, DesignSystemInfo, CategoryInfo, ScreenPattern } from '../types/index.js';

export class MCPServer {
  private server: Server;
  private configManager: ConfigManager;
  private scanner: ComponentScanner;
  private analyzer: ComponentAnalyzer;
  private cache: ComponentCache;
  private advancedCache: AdvancedCache;
  private similarityAnalyzer: SimilarityAnalyzer;
  private designSystemAnalyzer: DesignSystemAnalyzer;
  private categoryDetector: CategoryDetector;
  private performanceMonitor: PerformanceMonitor;
  private errorHandler: ErrorHandler;
  private configValidator: ConfigValidator;

  constructor() {
    this.server = new Server(
      {
        name: 'component-design-system-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.configManager = new ConfigManager();
    this.scanner = new ComponentScanner(this.configManager);
    this.analyzer = new ComponentAnalyzer(this.configManager);
    this.cache = new ComponentCache(this.configManager);
    this.advancedCache = new AdvancedCache();
    this.similarityAnalyzer = new SimilarityAnalyzer();
    this.designSystemAnalyzer = new DesignSystemAnalyzer();
    this.categoryDetector = new CategoryDetector();
    this.performanceMonitor = new PerformanceMonitor();
    this.errorHandler = new ErrorHandler();
    this.configValidator = new ConfigValidator();

    this.validateConfiguration();

    this.setupHandlers();
  }

  private validateConfiguration(): void {
    try {
      const config = this.configManager.getConfig();
      const validation = this.configValidator.validateConfig(config);
      
      if (!validation.valid) {
        for (const error of validation.errors) {
          this.errorHandler.handleError(
            new Error(error),
            { operation: 'config_validation', timestamp: new Date() },
            'high'
          );
        }
      }

      for (const warning of validation.warnings) {
        console.warn('Configuration warning:', warning);
      }

      const envValidation = this.configValidator.validateEnvironment();
      if (!envValidation.valid) {
        for (const error of envValidation.errors) {
          this.errorHandler.handleError(
            new Error(error),
            { operation: 'environment_validation', timestamp: new Date() },
            'critical'
          );
        }
      }
    } catch (error) {
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'config_validation', timestamp: new Date() },
        'critical'
      );
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_components',
          description: 'Get a list of all available components with summary information',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter components by category (optional)'
              },
              framework: {
                type: 'string',
                description: 'Filter components by framework (react-native, tailwind) (optional)'
              }
            }
          }
        },
        {
          name: 'get_component_details',
          description: 'Get detailed information about a specific component',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the component to get details for'
              }
            },
            required: ['name']
          }
        },
        {
          name: 'find_similar_components',
          description: 'Find components similar to a given description or component structure',
          inputSchema: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of the component you want to find similar ones for'
              },
              props: {
                type: 'array',
                description: 'Array of prop names to match against (optional)',
                items: { type: 'string' }
              }
            },
            required: ['description']
          }
        },
        {
          name: 'get_design_system',
          description: 'Get design system information including colors, typography, and spacing',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter design system info by category (optional)'
              }
            }
          }
        },
        {
          name: 'get_available_categories',
          description: 'Get list of available component categories',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'get_screen_patterns',
          description: 'Get common screen patterns and layouts',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter patterns by category (optional)'
              }
            }
          }
        },
        {
          name: 'get_performance_metrics',
          description: 'Get performance metrics and system diagnostics',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'get_error_report',
          description: 'Get error report and system health information',
          inputSchema: {
            type: 'object',
            properties: {
              severity: {
                type: 'string',
                description: 'Filter errors by severity (low, medium, high, critical) (optional)'
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_components':
            return await this.handleListComponents(args);
          case 'get_component_details':
            return await this.handleGetComponentDetails(args);
          case 'find_similar_components':
            return await this.handleFindSimilarComponents(args);
          case 'get_design_system':
            return await this.handleGetDesignSystem(args);
          case 'get_available_categories':
            return await this.handleGetAvailableCategories(args);
          case 'get_screen_patterns':
            return await this.handleGetScreenPatterns(args);
          case 'get_performance_metrics':
            return await this.handleGetPerformanceMetrics(args);
          case 'get_error_report':
            return await this.handleGetErrorReport(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    });
  }

  private async handleListComponents(args: any) {
    const components = await this.getAllComponents();
    let filtered = components;

    if (args.category) {
      filtered = filtered.filter(c => c.category === args.category);
    }

    if (args.framework) {
      filtered = filtered.filter(c => c.framework === args.framework);
    }

    const summaries: ComponentSummary[] = filtered.map(component => ({
      name: component.name,
      filePath: component.filePath,
      framework: component.framework,
      category: component.category,
      propsCount: component.props.length,
      lastModified: component.lastModified
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(summaries, null, 2)
        }
      ]
    };
  }

  private async handleGetComponentDetails(args: any) {
    if (!args.name) {
      throw new Error('Component name is required');
    }

    const components = await this.getAllComponents();
    const component = components.find(c => c.name === args.name);

    if (!component) {
      throw new Error(`Component '${args.name}' not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(component, null, 2)
        }
      ]
    };
  }

  private async handleFindSimilarComponents(args: any) {
    if (!args.description) {
      throw new Error('Description is required');
    }

    const components = await this.getAllComponents();
    
    const targetComponent = components.find(c => 
      c.description?.toLowerCase().includes(args.description.toLowerCase()) ||
      c.name.toLowerCase().includes(args.description.toLowerCase())
    );

    if (!targetComponent) {
      const syntheticComponent: ComponentInfo = {
        name: args.description,
        filePath: '',
        framework: 'unknown',
        props: args.props ? args.props.map((name: string) => ({ name, type: 'unknown', required: false })) : [],
        styles: [],
        usageExamples: [],
        dependencies: [],
        category: 'general',
        description: args.description,
        lastModified: new Date()
      };
      
      const matches = this.similarityAnalyzer.findSimilarComponents(syntheticComponent, components, 0.3, 10);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              searchQuery: args.description,
              matches: matches.map(match => ({
                component: {
                  name: match.component.name,
                  filePath: match.component.filePath,
                  framework: match.component.framework,
                  category: match.component.category
                },
                similarity: match.similarity,
                matchReasons: match.matchReasons,
                differences: match.differences
              }))
            }, null, 2)
          }
        ]
      };
    }

    const matches = this.similarityAnalyzer.findSimilarComponents(targetComponent, components, 0.5, 10);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            targetComponent: targetComponent.name,
            matches: matches.map(match => ({
              component: {
                name: match.component.name,
                filePath: match.component.filePath,
                framework: match.component.framework,
                category: match.component.category
              },
              similarity: match.similarity,
              matchReasons: match.matchReasons,
              differences: match.differences
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetDesignSystem(args: any) {
    const cacheKey = `design_system_${args.category || 'all'}`;
    
    let designSystem = this.advancedCache.get<DesignSystemInfo>(cacheKey);
    
    if (!designSystem) {
      const components = await this.getAllComponents();
      let filteredComponents = components;
      
      if (args.category) {
        filteredComponents = components.filter(c => c.category === args.category);
      }
      
      designSystem = this.designSystemAnalyzer.analyzeDesignSystem(filteredComponents);
      
      this.advancedCache.set(cacheKey, designSystem, 600000);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(designSystem, null, 2)
        }
      ]
    };
  }

  private async handleGetAvailableCategories(args: any) {
    const components = await this.getAllComponents();
    const categoryMap = new Map<string, number>();

    components.forEach(component => {
      const count = categoryMap.get(component.category) || 0;
      categoryMap.set(component.category, count + 1);
    });

    const categories: CategoryInfo[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      componentCount: count,
      description: `Components in the ${name} category`,
      examples: components
        .filter(c => c.category === name)
        .slice(0, 3)
        .map(c => c.name)
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(categories, null, 2)
        }
      ]
    };
  }

  private async handleGetScreenPatterns(args: any) {
    const components = await this.getAllComponents();
    
    // Filter for screen components
    let screenComponents = components.filter(c => 
      c.category === 'screens' || 
      c.name.toLowerCase().includes('screen') ||
      c.filePath.toLowerCase().includes('/screens/') ||
      c.filePath.toLowerCase().includes('/pages/')
    );

    if (args.category) {
      screenComponents = screenComponents.filter(c => c.category === args.category);
    }

    const patterns: ScreenPattern[] = screenComponents.map(component => ({
      name: component.name,
      category: component.category,
      framework: component.framework,
      commonProps: component.props.slice(0, 5),
      commonStyles: component.styles.slice(0, 10),
      usageFrequency: 1,
      examples: [component.filePath],
      description: component.description || `${component.name} screen pattern`
    }));

    const groupedPatterns = this.groupSimilarPatterns(patterns);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalPatterns: groupedPatterns.length,
            patterns: groupedPatterns
          }, null, 2)
        }
      ]
    };
  }

  private groupSimilarPatterns(patterns: ScreenPattern[]): ScreenPattern[] {
    const grouped: ScreenPattern[] = [];
    const processed = new Set<string>();

    for (const pattern of patterns) {
      if (processed.has(pattern.name)) continue;

      const similar = patterns.filter(p => 
        !processed.has(p.name) && 
        p.category === pattern.category &&
        p.framework === pattern.framework
      );

      if (similar.length > 1) {
        const merged: ScreenPattern = {
          name: `${pattern.category}_${pattern.framework}_pattern`,
          category: pattern.category,
          framework: pattern.framework,
          commonProps: this.mergeProps(similar.map(p => p.commonProps)),
          commonStyles: this.mergeStyles(similar.map(p => p.commonStyles)),
          usageFrequency: similar.length,
          examples: similar.map(p => p.examples).flat(),
          description: `Common ${pattern.category} pattern for ${pattern.framework}`
        };
        grouped.push(merged);
        
        similar.forEach(p => processed.add(p.name));
      } else {
        grouped.push(pattern);
        processed.add(pattern.name);
      }
    }

    return grouped;
  }

  private mergeProps(propArrays: any[][]): any[] {
    const propMap = new Map<string, any>();
    
    for (const props of propArrays) {
      for (const prop of props) {
        if (!propMap.has(prop.name)) {
          propMap.set(prop.name, { ...prop, frequency: 1 });
        } else {
          propMap.get(prop.name)!.frequency++;
        }
      }
    }
    
    return Array.from(propMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  private mergeStyles(styleArrays: any[][]): any[] {
    const styleMap = new Map<string, any>();
    
    for (const styles of styleArrays) {
      for (const style of styles) {
        const key = `${style.property}:${style.value}`;
        if (!styleMap.has(key)) {
          styleMap.set(key, { ...style, frequency: 1 });
        } else {
          styleMap.get(key)!.frequency++;
        }
      }
    }
    
    return Array.from(styleMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private async handleGetPerformanceMetrics(args: any) {
    const metrics = this.performanceMonitor.getMetrics();
    const cacheStats = this.advancedCache.getStats();
    const errorSummary = this.errorHandler.getErrorSummary();

    const diagnostics = {
      performance: metrics,
      cache: cacheStats,
      errors: errorSummary,
      timestamp: new Date(),
      uptime: process.uptime ? process.uptime() : 0
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(diagnostics, null, 2)
        }
      ]
    };
  }

  private async handleGetErrorReport(args: any) {
    const errors = this.errorHandler.getErrors(args.severity);
    const summary = this.errorHandler.getErrorSummary();

    const report = {
      summary,
      errors: errors.map(error => ({
        message: error.error.message,
        context: error.context,
        severity: error.severity,
        recoverable: error.recoverable,
        timestamp: error.context.timestamp
      })),
      timestamp: new Date()
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2)
        }
      ]
    };
  }

  private async getAllComponents(): Promise<ComponentInfo[]> {
    this.performanceMonitor.startTimer('scan');
    
    try {
      const cachedComponents = this.cache.getAllComponents();
      if (cachedComponents.length > 0) {
        this.performanceMonitor.updateCacheHitRate(1.0);
        return cachedComponents;
      }

      this.performanceMonitor.updateCacheHitRate(0.0);
      const filePaths = await this.scanner.scanForComponents();
      this.performanceMonitor.endTimer('scan');
      
      this.performanceMonitor.startTimer('analysis');
      const components: ComponentInfo[] = [];

      for (const filePath of filePaths) {
        try {
          const component = await this.analyzer.analyzeComponent(filePath);
          if (component) {
            components.push(component);
            this.cache.setComponent(component);
            this.performanceMonitor.incrementComponentCount();
          }
        } catch (error) {
          this.errorHandler.handleError(
            error instanceof Error ? error : new Error(String(error)),
            { 
              operation: 'component_analysis', 
              filePath, 
              timestamp: new Date() 
            },
            'medium'
          );
          this.performanceMonitor.incrementErrorCount();
        }
      }

      this.performanceMonitor.endTimer('analysis');
      return components;
    } catch (error) {
      this.performanceMonitor.endTimer('scan');
      this.errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'get_all_components', timestamp: new Date() },
        'high'
      );
      throw error;
    }
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Component Design System MCP Server started');
  }
}
