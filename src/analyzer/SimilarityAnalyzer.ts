import { ComponentInfo, PropInfo, StyleInfo } from '../types';

export interface ComponentMatch {
  component: ComponentInfo;
  similarity: number;
  matchReasons: string[];
  differences: string[];
}

export class SimilarityAnalyzer {
  public findSimilarComponents(
    targetComponent: ComponentInfo,
    allComponents: ComponentInfo[],
    threshold: number = 0.3,
    maxResults?: number
  ): ComponentMatch[] {
    const matches: ComponentMatch[] = [];

    for (const component of allComponents) {
      const similarity = this.calculateSimilarity(targetComponent, component);
      
      if (similarity >= threshold) {
        const matchReasons = this.getMatchReasons(targetComponent, component);
        const differences = this.getDifferences(targetComponent, component);

        matches.push({
          component,
          similarity,
          matchReasons,
          differences
        });
      }
    }

    const sortedMatches = matches.sort((a, b) => b.similarity - a.similarity);
    return maxResults ? sortedMatches.slice(0, maxResults) : sortedMatches;
  }

  private calculateSimilarity(comp1: ComponentInfo, comp2: ComponentInfo): number {
    if (comp1.name === comp2.name && comp1.filePath === comp2.filePath) {
      return 1.0;
    }

    let totalScore = 0;
    let maxScore = 0;

    const nameSimilarity = this.calculateStringSimilarity(comp1.name, comp2.name);
    totalScore += nameSimilarity * 0.3;
    maxScore += 0.3;

    if (comp1.category === comp2.category) {
      totalScore += 0.2;
    }
    maxScore += 0.2;

    if (comp1.framework === comp2.framework) {
      totalScore += 0.1;
    }
    maxScore += 0.1;

    const propsSimilarity = this.calculatePropsSimilarity(comp1.props, comp2.props);
    totalScore += propsSimilarity * 0.25;
    maxScore += 0.25;

    const stylesSimilarity = this.calculateStylesSimilarity(comp1.styles, comp2.styles);
    totalScore += stylesSimilarity * 0.15;
    maxScore += 0.15;

    return maxScore > 0 ? totalScore / maxScore : 0;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculatePropsSimilarity(props1: PropInfo[], props2: PropInfo[]): number {
    if (props1.length === 0 && props2.length === 0) return 1;
    if (props1.length === 0 || props2.length === 0) return 0;

    const commonProps = props1.filter(p1 => 
      props2.some(p2 => p1.name === p2.name && p1.type === p2.type)
    );

    const totalProps = new Set([...props1.map(p => p.name), ...props2.map(p => p.name)]).size;
    return commonProps.length / totalProps;
  }

  private calculateStylesSimilarity(styles1: StyleInfo[], styles2: StyleInfo[]): number {
    if (styles1.length === 0 && styles2.length === 0) return 1;
    if (styles1.length === 0 || styles2.length === 0) return 0;

    const commonStyles = styles1.filter(s1 => 
      styles2.some(s2 => s1.property === s2.property && s1.value === s2.value)
    );

    const totalStyles = new Set([
      ...styles1.map(s => `${s.property}:${s.value}`),
      ...styles2.map(s => `${s.property}:${s.value}`)
    ]).size;

    return commonStyles.length / totalStyles;
  }

  private getMatchReasons(comp1: ComponentInfo, comp2: ComponentInfo): string[] {
    const reasons: string[] = [];

    if (comp1.category === comp2.category) {
      reasons.push(`Same category: ${comp1.category}`);
    }

    if (comp1.framework === comp2.framework) {
      reasons.push(`Same framework: ${comp1.framework}`);
    }

    const commonProps = comp1.props.filter(p1 => 
      comp2.props.some(p2 => p1.name === p2.name)
    );
    if (commonProps.length > 0) {
      reasons.push(`Common props: ${commonProps.map(p => p.name).join(', ')}`);
    }

    const nameSimilarity = this.calculateStringSimilarity(comp1.name, comp2.name);
    if (nameSimilarity > 0.5) {
      reasons.push(`Similar names: ${comp1.name} / ${comp2.name}`);
    }

    return reasons;
  }

  private getDifferences(comp1: ComponentInfo, comp2: ComponentInfo): string[] {
    const differences: string[] = [];

    if (comp1.category !== comp2.category) {
      differences.push(`Different categories: ${comp1.category} vs ${comp2.category}`);
    }

    if (comp1.framework !== comp2.framework) {
      differences.push(`Different frameworks: ${comp1.framework} vs ${comp2.framework}`);
    }

    const uniqueProps1 = comp1.props.filter(p1 => 
      !comp2.props.some(p2 => p1.name === p2.name)
    );
    if (uniqueProps1.length > 0) {
      differences.push(`Unique props in ${comp1.name}: ${uniqueProps1.map(p => p.name).join(', ')}`);
    }

    const uniqueProps2 = comp2.props.filter(p2 => 
      !comp1.props.some(p1 => p1.name === p2.name)
    );
    if (uniqueProps2.length > 0) {
      differences.push(`Unique props in ${comp2.name}: ${uniqueProps2.map(p => p.name).join(', ')}`);
    }

    return differences;
  }
}
