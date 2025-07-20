import { SimilarityAnalyzer } from '../analyzer/SimilarityAnalyzer';
import { ComponentInfo } from '../types';

describe('SimilarityAnalyzer', () => {
  let analyzer: SimilarityAnalyzer;
  let sampleComponents: ComponentInfo[];

  beforeEach(() => {
    analyzer = new SimilarityAnalyzer();
    
    sampleComponents = [
      {
        name: 'Button',
        filePath: './src/Button.tsx',
        framework: 'react-native',
        props: [
          { name: 'title', type: 'string', required: true },
          { name: 'onPress', type: '() => void', required: true },
          { name: 'disabled', type: 'boolean', required: false }
        ],
        styles: [
          { property: 'backgroundColor', value: '#007AFF', frequency: 1, context: 'style' }
        ],
        usageExamples: [],
        dependencies: [],
        category: 'button',
        lastModified: new Date()
      },
      {
        name: 'PrimaryButton',
        filePath: './src/PrimaryButton.tsx',
        framework: 'react-native',
        props: [
          { name: 'title', type: 'string', required: true },
          { name: 'onPress', type: '() => void', required: true },
          { name: 'loading', type: 'boolean', required: false }
        ],
        styles: [
          { property: 'backgroundColor', value: '#007AFF', frequency: 1, context: 'style' }
        ],
        usageExamples: [],
        dependencies: [],
        category: 'button',
        lastModified: new Date()
      },
      {
        name: 'TextInput',
        filePath: './src/TextInput.tsx',
        framework: 'react-native',
        props: [
          { name: 'value', type: 'string', required: true },
          { name: 'onChangeText', type: '(text: string) => void', required: true }
        ],
        styles: [],
        usageExamples: [],
        dependencies: [],
        category: 'input',
        lastModified: new Date()
      }
    ];
  });

  describe('findSimilarComponents', () => {
    it('should find similar components based on category and props', () => {
      const targetComponent = sampleComponents[0]; // Button
      const matches = analyzer.findSimilarComponents(targetComponent, sampleComponents);
      
      expect(matches).toHaveLength(1);
      expect(matches[0].component.name).toBe('PrimaryButton');
      expect(matches[0].similarity).toBeGreaterThan(0.5);
    });

    it('should not include the target component in results', () => {
      const targetComponent = sampleComponents[0];
      const matches = analyzer.findSimilarComponents(targetComponent, sampleComponents);
      
      expect(matches.every(match => match.component.filePath !== targetComponent.filePath)).toBe(true);
    });

    it('should return empty array when no similar components found', () => {
      const targetComponent = sampleComponents[2]; // TextInput
      const matches = analyzer.findSimilarComponents(targetComponent, sampleComponents, 0.8);
      
      expect(matches).toHaveLength(0);
    });

    it('should provide match reasons', () => {
      const targetComponent = sampleComponents[0];
      const matches = analyzer.findSimilarComponents(targetComponent, sampleComponents);
      
      expect(matches[0].matchReasons).toContain('Same category: button');
      expect(matches[0].matchReasons).toContain('Same framework: react-native');
    });

    it('should provide differences', () => {
      const targetComponent = sampleComponents[0];
      const matches = analyzer.findSimilarComponents(targetComponent, sampleComponents);
      
      expect(matches[0].differences.length).toBeGreaterThan(0);
    });
  });

  describe('similarity calculation', () => {
    it('should calculate higher similarity for components with same category', () => {
      const button1 = sampleComponents[0];
      const button2 = sampleComponents[1];
      const input = sampleComponents[2];
      
      const matches1 = analyzer.findSimilarComponents(button1, [button2, input]);
      const buttonMatch = matches1.find(m => m.component.name === 'PrimaryButton');
      const inputMatch = matches1.find(m => m.component.name === 'TextInput');
      
      if (buttonMatch && inputMatch) {
        expect(buttonMatch.similarity).toBeGreaterThan(inputMatch.similarity);
      }
    });
  });
});
