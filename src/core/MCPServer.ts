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
import { ComponentInfo, ComponentSummary, ComponentMatch, DesignSystemInfo, CategoryInfo, ScreenPattern } from '../types';

export class MCPServer {
  private server: Server;
  private configManager: ConfigManager;
  private scanner: ComponentScanner;
  private analyzer: ComponentAnalyzer;
  private cache: ComponentCache;

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

    this.setupHandlers();
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
    const matches: ComponentMatch[] = components
      .filter(c => c.description?.toLowerCase().includes(args.description.toLowerCase()) ||
                   c.name.toLowerCase().includes(args.description.toLowerCase()))
      .map(component => ({
        component,
        similarity: 0.8, // Placeholder similarity score
        matchReasons: ['Name similarity', 'Description match'],
        differences: ['Different props structure']
      }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(matches, null, 2)
        }
      ]
    };
  }

  private async handleGetDesignSystem(args: any) {
    const designSystem: DesignSystemInfo = {
      colors: {
        primary: [],
        secondary: [],
        neutral: [],
        semantic: {
          success: [],
          warning: [],
          error: [],
          info: []
        }
      },
      typography: {
        fontSizes: {},
        fontWeights: {},
        lineHeights: {},
        fontFamilies: {}
      },
      spacing: {
        margins: {},
        paddings: {},
        gaps: {}
      },
      commonPatterns: [],
      extractedAt: new Date()
    };

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
    const patterns: ScreenPattern[] = [];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(patterns, null, 2)
        }
      ]
    };
  }

  private async getAllComponents(): Promise<ComponentInfo[]> {
    const cachedComponents = this.cache.getAllComponents();
    if (cachedComponents.length > 0) {
      return cachedComponents;
    }

    const filePaths = await this.scanner.scanForComponents();
    const components: ComponentInfo[] = [];

    for (const filePath of filePaths) {
      try {
        const component = await this.analyzer.analyzeComponent(filePath);
        if (component) {
          components.push(component);
          this.cache.setComponent(component);
        }
      } catch (error) {
        console.warn(`Failed to analyze component at ${filePath}:`, error);
      }
    }

    return components;
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Component Design System MCP Server started');
  }
}
