import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../config/ConfigManager.js';
import { ComponentInfo, PropInfo, StyleInfo } from '../types';
import { ASTParser } from '../utils/ASTParser';

export class ComponentAnalyzer {
  constructor(private configManager: ConfigManager) {}

  public async analyzeComponent(filePath: string): Promise<ComponentInfo | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      
      const componentName = this.extractComponentName(filePath);
      const framework = this.detectFramework(content, filePath);
      const category = this.detectCategory(filePath);
      
      const props = this.extractProps(content);
      const styles = this.extractStyles(content, framework);
      const usageExamples = this.extractUsageExamples(content);
      const dependencies = this.extractDependencies(content);
      const description = this.extractDescription(content);

      return {
        name: componentName,
        filePath,
        framework,
        props,
        styles,
        usageExamples,
        dependencies,
        category,
        description,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.warn(`Failed to analyze component ${filePath}:`, error);
      return null;
    }
  }

  private extractComponentName(filePath: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    const cleanName = fileName
      .replace(/Component$/, '')
      .replace(/Screen$/, '')
      .replace(/Page$/, '');
    
    return cleanName || fileName;
  }

  private detectFramework(content: string, filePath: string): 'react-native' | 'tailwind' | 'unknown' {
    if (content.includes('react-native') || 
        content.includes('StyleSheet') ||
        content.includes('View') ||
        content.includes('Text')) {
      return 'react-native';
    }

    if (content.includes('className=') ||
        content.includes('@apply') ||
        content.includes('tailwind')) {
      return 'tailwind';
    }

    return 'unknown';
  }

  private detectCategory(filePath: string): string {
    const normalizedPath = filePath.toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();

    if (normalizedPath.includes('/auth/') || normalizedPath.includes('/authentication/')) return 'auth';
    if (normalizedPath.includes('/forms/') || normalizedPath.includes('/form/')) return 'forms';
    if (normalizedPath.includes('/ui/') || normalizedPath.includes('/components/ui/')) return 'ui';
    if (normalizedPath.includes('/layout/') || normalizedPath.includes('/layouts/')) return 'layout';
    if (normalizedPath.includes('/screens/') || normalizedPath.includes('/pages/')) return 'screens';

    if (fileName.includes('login') || fileName.includes('signin') || fileName.includes('auth')) return 'auth';
    if (fileName.includes('button') || fileName.includes('input') || fileName.includes('form')) return 'forms';
    if (fileName.includes('list') || fileName.includes('table') || fileName.includes('grid')) return 'list';
    if (fileName.includes('detail') || fileName.includes('info') || fileName.includes('profile')) return 'detail';
    if (fileName.includes('modal') || fileName.includes('dialog') || fileName.includes('popup')) return 'overlay';
    if (fileName.includes('header') || fileName.includes('footer') || fileName.includes('nav')) return 'layout';

    return 'general';
  }

  private extractProps(content: string): PropInfo[] {
    const props: PropInfo[] = [];

    try {
      const astParser = new ASTParser(content);
      const interfaces = astParser.extractInterfaces();
      const typeAliases = astParser.extractTypeAliases();

      for (const interfaceInfo of interfaces) {
        if (interfaceInfo.name.includes('Props')) {
          for (const prop of interfaceInfo.properties) {
            props.push({
              name: prop.name,
              type: prop.type,
              required: !prop.optional,
              description: undefined
            });
          }
        }
      }

      for (const typeAlias of typeAliases) {
        if (typeAlias.name.includes('Props') && typeAlias.type.includes('{')) {
          const typeProps = this.parsePropsFromTypeString(typeAlias.type);
          props.push(...typeProps);
        }
      }

      if (props.length === 0) {
        return this.extractPropsWithRegex(content);
      }

    } catch (error) {
      console.warn('AST parsing failed, falling back to regex:', error);
      return this.extractPropsWithRegex(content);
    }

    return props;
  }

  private extractPropsWithRegex(content: string): PropInfo[] {
    const props: PropInfo[] = [];

    const interfaceRegex = /interface\s+(\w+Props)\s*{([^}]+)}/g;
    const typeRegex = /type\s+(\w+Props)\s*=\s*{([^}]+)}/g;

    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      const propsContent = match[2];
      const extractedProps = this.parsePropsFromContent(propsContent);
      props.push(...extractedProps);
    }

    while ((match = typeRegex.exec(content)) !== null) {
      const propsContent = match[2];
      const extractedProps = this.parsePropsFromContent(propsContent);
      props.push(...extractedProps);
    }

    return props;
  }

  private parsePropsFromTypeString(typeString: string): PropInfo[] {
    const props: PropInfo[] = [];
    const content = typeString.replace(/^[^{]*{/, '').replace(/}[^}]*$/, '');
    return this.parsePropsFromContent(content);
  }

  private parsePropsFromContent(propsContent: string): PropInfo[] {
    const props: PropInfo[] = [];
    const lines = propsContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

      const propMatch = trimmed.match(/(\w+)(\??):\s*([^;,]+)/);
      if (propMatch) {
        const [, name, optional, type] = propMatch;
        props.push({
          name,
          type: type.trim(),
          required: !optional,
          description: this.extractPropDescription(line)
        });
      }
    }

    return props;
  }

  private extractPropDescription(line: string): string | undefined {
    const commentMatch = line.match(/\/\*\*?\s*([^*]+)\s*\*?\//);
    return commentMatch ? commentMatch[1].trim() : undefined;
  }

  private extractStyles(content: string, framework: 'react-native' | 'tailwind' | 'unknown'): StyleInfo[] {
    const styles: StyleInfo[] = [];

    if (framework === 'react-native') {
      const styleSheetStart = content.indexOf('StyleSheet.create(');
      if (styleSheetStart !== -1) {
        const openBraceIndex = content.indexOf('{', styleSheetStart);
        if (openBraceIndex !== -1) {
          let braceCount = 1;
          let currentIndex = openBraceIndex + 1;
          
          while (currentIndex < content.length && braceCount > 0) {
            if (content[currentIndex] === '{') {
              braceCount++;
            } else if (content[currentIndex] === '}') {
              braceCount--;
            }
            currentIndex++;
          }
          
          if (braceCount === 0) {
            const stylesContent = content.substring(openBraceIndex + 1, currentIndex - 1);
            const extractedStyles = this.parseReactNativeStyles(stylesContent);
            styles.push(...extractedStyles);
          }
        }
      }
    } else if (framework === 'tailwind') {
      const classNameRegex = /className=["']([^"']+)["']/g;
      let match;
      while ((match = classNameRegex.exec(content)) !== null) {
        const classNames = match[1].split(/\s+/);
        for (const className of classNames) {
          if (className.trim()) {
            styles.push({
              property: 'className',
              value: className.trim(),
              frequency: 1,
              context: 'className'
            });
          }
        }
      }
    }

    return styles;
  }

  private parseReactNativeStyles(stylesContent: string): StyleInfo[] {
    const styles: StyleInfo[] = [];
    
    const styleObjectRegex = /(\w+):\s*{([^}]+)}/g;
    let styleMatch;
    
    while ((styleMatch = styleObjectRegex.exec(stylesContent)) !== null) {
      const styleName = styleMatch[1];
      const styleProperties = styleMatch[2];
      
      const propertyRegex = /(\w+):\s*([^,\n]+)/g;
      let propMatch;
      
      while ((propMatch = propertyRegex.exec(styleProperties)) !== null) {
        const [, property, value] = propMatch;
        styles.push({
          name: styleName,
          property,
          value: value.replace(/[,;]$/, '').trim(),
          frequency: 1,
          context: 'StyleSheet'
        });
      }
    }

    return styles;
  }

  private extractUsageExamples(content: string): string[] {
    const examples: string[] = [];

    const exampleRegex = /\/\*\*?[\s\S]*?@example\s+([\s\S]*?)\*\//g;
    let match;
    while ((match = exampleRegex.exec(content)) !== null) {
      examples.push(match[1].trim());
    }

    return examples;
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const dependency = match[1];
      if (!dependency.startsWith('.') && !dependency.startsWith('/')) {
        dependencies.push(dependency);
      }
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  private extractDescription(content: string): string | undefined {
    const descriptionRegex = /\/\*\*\s*\n\s*\*\s*([^@\n]+)/;
    const match = content.match(descriptionRegex);
    return match ? match[1].trim() : undefined;
  }
}
