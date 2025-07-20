import * as path from 'path';
import { ComponentInfo } from '../types/index.js';

export interface CategoryRule {
  name: string;
  pathPatterns: string[];
  fileNamePatterns: string[];
  contentPatterns: string[];
  priority: number;
}

export class CategoryDetector {
  private rules: CategoryRule[] = [
    {
      name: 'auth',
      pathPatterns: ['/auth/', '/authentication/', '/login/', '/signin/'],
      fileNamePatterns: ['login', 'signin', 'signup', 'auth', 'register'],
      contentPatterns: ['password', 'email', 'authenticate', 'login', 'signin'],
      priority: 10
    },
    {
      name: 'forms',
      pathPatterns: ['/forms/', '/form/'],
      fileNamePatterns: ['form', 'input', 'field', 'validation'],
      contentPatterns: ['onSubmit', 'validation', 'formik', 'react-hook-form'],
      priority: 9
    },
    {
      name: 'navigation',
      pathPatterns: ['/navigation/', '/nav/', '/menu/'],
      fileNamePatterns: ['nav', 'menu', 'drawer', 'tab', 'stack'],
      contentPatterns: ['navigation', 'navigate', 'router', 'route'],
      priority: 8
    },
    {
      name: 'ui',
      pathPatterns: ['/ui/', '/components/ui/', '/common/'],
      fileNamePatterns: ['button', 'modal', 'dialog', 'alert', 'toast'],
      contentPatterns: ['className', 'styled', 'theme'],
      priority: 7
    },
    {
      name: 'layout',
      pathPatterns: ['/layout/', '/layouts/', '/containers/'],
      fileNamePatterns: ['layout', 'container', 'wrapper', 'header', 'footer'],
      contentPatterns: ['flex', 'grid', 'container', 'wrapper'],
      priority: 6
    },
    {
      name: 'screens',
      pathPatterns: ['/screens/', '/pages/', '/views/'],
      fileNamePatterns: ['screen', 'page', 'view'],
      contentPatterns: ['Screen', 'Page', 'View'],
      priority: 5
    },
    {
      name: 'list',
      pathPatterns: ['/list/', '/table/', '/grid/'],
      fileNamePatterns: ['list', 'table', 'grid', 'item', 'row'],
      contentPatterns: ['FlatList', 'SectionList', 'map(', 'forEach'],
      priority: 4
    },
    {
      name: 'detail',
      pathPatterns: ['/detail/', '/details/', '/profile/'],
      fileNamePatterns: ['detail', 'profile', 'info', 'about'],
      contentPatterns: ['detail', 'profile', 'information'],
      priority: 3
    },
    {
      name: 'overlay',
      pathPatterns: ['/modal/', '/dialog/', '/popup/', '/overlay/'],
      fileNamePatterns: ['modal', 'dialog', 'popup', 'overlay', 'sheet'],
      contentPatterns: ['Modal', 'Dialog', 'Popup', 'overlay', 'visible'],
      priority: 2
    }
  ];

  public detectCategory(component: ComponentInfo, content?: string): string {
    const filePath = component.filePath.toLowerCase();
    const fileName = path.basename(component.filePath).toLowerCase();
    const componentName = component.name.toLowerCase();

    let bestMatch: { category: string; score: number } = { category: 'general', score: 0 };

    for (const rule of this.rules) {
      let score = 0;

      for (const pattern of rule.pathPatterns) {
        if (filePath.includes(pattern)) {
          score += rule.priority * 3;
        }
      }

      for (const pattern of rule.fileNamePatterns) {
        if (fileName.includes(pattern) || componentName.includes(pattern)) {
          score += rule.priority * 2;
        }
      }

      if (content) {
        for (const pattern of rule.contentPatterns) {
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            score += rule.priority;
          }
        }
      }

      for (const prop of component.props) {
        for (const pattern of rule.contentPatterns) {
          if (prop.name.toLowerCase().includes(pattern.toLowerCase()) ||
              prop.type.toLowerCase().includes(pattern.toLowerCase())) {
            score += rule.priority * 0.5;
          }
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { category: rule.name, score };
      }
    }

    return bestMatch.category;
  }

  public addRule(rule: CategoryRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  public removeRule(name: string): boolean {
    const index = this.rules.findIndex(rule => rule.name === name);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  public getRules(): CategoryRule[] {
    return [...this.rules];
  }

  public getCategoryStats(components: ComponentInfo[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const component of components) {
      const category = component.category || 'general';
      stats[category] = (stats[category] || 0) + 1;
    }

    return stats;
  }

  public suggestCategories(component: ComponentInfo, content?: string): Array<{ category: string; confidence: number }> {
    const suggestions: Array<{ category: string; confidence: number }> = [];
    const filePath = component.filePath.toLowerCase();
    const fileName = path.basename(component.filePath).toLowerCase();
    const componentName = component.name.toLowerCase();

    for (const rule of this.rules) {
      let score = 0;
      let maxScore = 0;

      maxScore += rule.pathPatterns.length * rule.priority * 3;
      maxScore += rule.fileNamePatterns.length * rule.priority * 2;
      maxScore += rule.contentPatterns.length * rule.priority;

      for (const pattern of rule.pathPatterns) {
        if (filePath.includes(pattern)) {
          score += rule.priority * 3;
        }
      }

      for (const pattern of rule.fileNamePatterns) {
        if (fileName.includes(pattern) || componentName.includes(pattern)) {
          score += rule.priority * 2;
        }
      }

      if (content) {
        for (const pattern of rule.contentPatterns) {
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            score += rule.priority;
          }
        }
      }

      if (score > 0 && maxScore > 0) {
        const confidence = Math.min(score / maxScore, 1);
        suggestions.push({ category: rule.name, confidence });
      }
    }

    return suggestions
      .filter(s => s.confidence > 0.1)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
}
