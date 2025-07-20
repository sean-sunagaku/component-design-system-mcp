export interface ComponentInfo {
  name: string;
  filePath: string;
  framework: 'react-native' | 'tailwind' | 'unknown';
  props: PropInfo[];
  styles: StyleInfo[];
  usageExamples: string[];
  dependencies: string[];
  category: string;
  description?: string;
  lastModified: Date;
}

export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface StyleInfo {
  property: string;
  value: string;
  frequency: number;
  context: 'className' | 'style' | 'theme';
}

export interface Config {
  scanPaths: string[];
  excludePatterns: string[];
  frameworks: FrameworkConfig[];
  componentPatterns: string[];
  cacheEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface FrameworkConfig {
  name: 'react-native' | 'tailwind';
  enabled: boolean;
  fileExtensions: string[];
  componentPatterns: string[];
  stylePatterns: string[];
}

export interface ComponentSummary {
  name: string;
  filePath: string;
  framework: string;
  category: string;
  propsCount: number;
  lastModified: Date;
}

export interface ComponentMatch {
  component: ComponentInfo;
  similarity: number;
  matchReasons: string[];
  differences: string[];
}

export interface DesignSystemInfo {
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  commonPatterns: StylePattern[];
  extractedAt: Date;
}

export interface ColorPalette {
  primary: ColorInfo[];
  secondary: ColorInfo[];
  neutral: ColorInfo[];
  semantic: {
    success: ColorInfo[];
    warning: ColorInfo[];
    error: ColorInfo[];
    info: ColorInfo[];
  };
}

export interface ColorInfo {
  name: string;
  value: string;
  usage: number;
  contexts: string[];
}

export interface TypographySystem {
  fontSizes: Record<string, FontSizeInfo>;
  fontWeights: Record<string, FontWeightInfo>;
  lineHeights: Record<string, LineHeightInfo>;
  fontFamilies: Record<string, FontFamilyInfo>;
}

export interface FontSizeInfo {
  value: string;
  usage: number;
}

export interface FontWeightInfo {
  value: string;
  usage: number;
}

export interface LineHeightInfo {
  value: string;
  usage: number;
}

export interface FontFamilyInfo {
  value: string;
  usage: number;
}

export interface SpacingSystem {
  margins: Record<string, SpacingInfo>;
  paddings: Record<string, SpacingInfo>;
  gaps: Record<string, SpacingInfo>;
}

export interface SpacingInfo {
  value: string;
  usage: number;
}

export interface StylePattern {
  name: string;
  pattern: string;
  usage: number;
  examples: string[];
}

export interface CategoryInfo {
  name: string;
  componentCount: number;
  description: string;
  examples: string[];
}

export interface ScreenPattern {
  name: string;
  category: string;
  framework: 'react-native' | 'tailwind' | 'unknown';
  commonProps: PropInfo[];
  commonStyles: StyleInfo[];
  usageFrequency: number;
  examples: string[];
  description: string;
}

export interface ComponentStructure {
  layout: string;
  components: string[];
  patterns: string[];
}
