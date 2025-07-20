import { ComponentInfo, StyleInfo, DesignSystemInfo, ColorPalette, ColorInfo, FontSizeInfo, SpacingInfo, FontWeightInfo, LineHeightInfo, FontFamilyInfo } from '../types';

export class DesignSystemAnalyzer {
  public analyzeDesignSystem(components: ComponentInfo[]): DesignSystemInfo {
    const colorPalette = this.extractColorPalette(components);
    const typography = this.extractTypography(components);
    const spacing = this.extractSpacing(components);
    const commonPatterns = this.extractCommonPatterns(components);

    return {
      colors: colorPalette,
      typography: {
        fontSizes: this.convertToFontSizeRecord(typography.fontSizes),
        fontWeights: this.convertToFontWeightRecord(typography.fontWeights),
        lineHeights: this.convertToLineHeightRecord(typography.lineHeights),
        fontFamilies: this.convertToFontFamilyRecord(typography.fontFamilies)
      },
      spacing: {
        margins: this.convertToSpacingRecord(spacing.margins),
        paddings: this.convertToSpacingRecord(spacing.paddings),
        gaps: this.convertToSpacingRecord(spacing.gaps)
      },
      commonPatterns: commonPatterns.map((pattern, index) => ({
        name: `pattern-${index}`,
        pattern,
        usage: 1,
        examples: []
      })),
      extractedAt: new Date()
    };
  }

  private extractColorPalette(components: ComponentInfo[]): ColorPalette {
    const colors: Record<string, Set<string>> = {
      background: new Set(),
      text: new Set(),
      border: new Set(),
      accent: new Set()
    };

    for (const component of components) {
      for (const style of component.styles) {
        this.categorizeColor(style, colors);
      }
    }

    return {
      primary: this.convertToColorInfo(Array.from(colors.accent)),
      secondary: this.convertToColorInfo(Array.from(colors.background)),
      neutral: this.convertToColorInfo(Array.from(colors.text)),
      semantic: {
        success: this.convertToColorInfo(['#10B981', 'green-500']),
        warning: this.convertToColorInfo(['#F59E0B', 'yellow-500']),
        error: this.convertToColorInfo(['#EF4444', 'red-500']),
        info: this.convertToColorInfo(['#3B82F6', 'blue-500'])
      }
    };
  }

  private categorizeColor(style: StyleInfo, colors: Record<string, Set<string>>): void {
    const property = style.property.toLowerCase();
    const value = style.value.toString();

    const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g;
    const colorMatches = value.match(colorRegex);

    if (colorMatches) {
      for (const color of colorMatches) {
        if (property.includes('background') || property.includes('bg')) {
          colors.background.add(color);
        } else if (property.includes('color') || property.includes('text')) {
          colors.text.add(color);
        } else if (property.includes('border')) {
          colors.border.add(color);
        } else {
          colors.accent.add(color);
        }
      }
    }

    if (style.context === 'className') {
      const tailwindColorRegex = /(bg|text|border)-(red|blue|green|yellow|purple|pink|gray|indigo|cyan|teal|lime|orange|amber|emerald|violet|fuchsia|rose|sky|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)/;
      const match = value.match(tailwindColorRegex);
      
      if (match) {
        const [, type, colorName, shade] = match;
        const colorValue = `${colorName}-${shade}`;
        
        if (type === 'bg') {
          colors.background.add(colorValue);
        } else if (type === 'text') {
          colors.text.add(colorValue);
        } else if (type === 'border') {
          colors.border.add(colorValue);
        }
      }
    }
  }

  private extractTypography(components: ComponentInfo[]): { fontSizes: string[], fontWeights: string[], fontFamilies: string[], lineHeights: string[] } {
    const typography = {
      fontSizes: new Set<string>(),
      fontWeights: new Set<string>(),
      fontFamilies: new Set<string>(),
      lineHeights: new Set<string>()
    };

    for (const component of components) {
      for (const style of component.styles) {
        const property = style.property.toLowerCase();
        const value = style.value.toString();

        if (property.includes('fontsize') || property.includes('font-size')) {
          typography.fontSizes.add(value);
        } else if (property.includes('fontweight') || property.includes('font-weight')) {
          typography.fontWeights.add(value);
        } else if (property.includes('fontfamily') || property.includes('font-family')) {
          typography.fontFamilies.add(value);
        } else if (property.includes('lineheight') || property.includes('line-height')) {
          typography.lineHeights.add(value);
        }

        if (style.context === 'className') {
          const textSizeMatch = value.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/);
          if (textSizeMatch) {
            typography.fontSizes.add(textSizeMatch[1]);
          }

          const fontWeightMatch = value.match(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/);
          if (fontWeightMatch) {
            typography.fontWeights.add(fontWeightMatch[1]);
          }
        }
      }
    }

    return {
      fontSizes: Array.from(typography.fontSizes),
      fontWeights: Array.from(typography.fontWeights),
      fontFamilies: Array.from(typography.fontFamilies),
      lineHeights: Array.from(typography.lineHeights)
    };
  }

  private extractSpacing(components: ComponentInfo[]): { margins: string[], paddings: string[], gaps: string[] } {
    const spacing = {
      margins: new Set<string>(),
      paddings: new Set<string>(),
      gaps: new Set<string>()
    };

    for (const component of components) {
      for (const style of component.styles) {
        const property = style.property.toLowerCase();
        const value = style.value.toString();

        if (property.includes('margin')) {
          spacing.margins.add(value);
        } else if (property.includes('padding')) {
          spacing.paddings.add(value);
        } else if (property.includes('gap')) {
          spacing.gaps.add(value);
        }

        if (style.context === 'className') {
          const spacingMatch = value.match(/(m|p|gap)-(0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)/);
          if (spacingMatch) {
            const [, type, size] = spacingMatch;
            if (type === 'm') {
              spacing.margins.add(size);
            } else if (type === 'p') {
              spacing.paddings.add(size);
            } else if (type === 'gap') {
              spacing.gaps.add(size);
            }
          }
        }
      }
    }

    return {
      margins: Array.from(spacing.margins),
      paddings: Array.from(spacing.paddings),
      gaps: Array.from(spacing.gaps)
    };
  }

  private extractCommonPatterns(components: ComponentInfo[]): string[] {
    const patterns: Record<string, number> = {};

    for (const component of components) {
      const componentPattern = this.getComponentPattern(component);
      patterns[componentPattern] = (patterns[componentPattern] || 0) + 1;

      for (const style of component.styles) {
        const stylePattern = `${style.property}:${style.value}`;
        patterns[stylePattern] = (patterns[stylePattern] || 0) + 1;
      }
    }

    return Object.entries(patterns)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([pattern]) => pattern);
  }

  private getComponentPattern(component: ComponentInfo): string {
    const propTypes = component.props.map(p => p.type).sort().join(',');
    const styleCount = component.styles.length;
    return `${component.category}:props(${propTypes}):styles(${styleCount})`;
  }

  private convertToColorInfo(colors: string[]): ColorInfo[] {
    return colors.map(color => ({
      name: color,
      value: color,
      usage: 1,
      contexts: ['component']
    }));
  }

  private convertToFontSizeRecord(items: string[]): Record<string, FontSizeInfo> {
    const result: Record<string, FontSizeInfo> = {};
    items.forEach(item => {
      result[item] = {
        value: item,
        usage: 1
      };
    });
    return result;
  }

  private convertToFontWeightRecord(items: string[]): Record<string, FontWeightInfo> {
    const result: Record<string, FontWeightInfo> = {};
    items.forEach(item => {
      result[item] = {
        value: item,
        usage: 1
      };
    });
    return result;
  }

  private convertToLineHeightRecord(items: string[]): Record<string, LineHeightInfo> {
    const result: Record<string, LineHeightInfo> = {};
    items.forEach(item => {
      result[item] = {
        value: item,
        usage: 1
      };
    });
    return result;
  }

  private convertToFontFamilyRecord(items: string[]): Record<string, FontFamilyInfo> {
    const result: Record<string, FontFamilyInfo> = {};
    items.forEach(item => {
      result[item] = {
        value: item,
        usage: 1
      };
    });
    return result;
  }

  private convertToSpacingRecord(items: string[]): Record<string, SpacingInfo> {
    const result: Record<string, SpacingInfo> = {};
    items.forEach(item => {
      result[item] = {
        value: item,
        usage: 1
      };
    });
    return result;
  }
}
