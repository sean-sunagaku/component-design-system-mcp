import { ComponentInfo } from '../types';
import { ConfigManager } from '../config/ConfigManager.js';

interface CacheEntry {
  data: ComponentInfo;
  lastModified: Date;
  accessCount: number;
  lastAccessed: Date;
}

export class ComponentCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000;

  constructor(private configManager: ConfigManager) {}

  public setComponent(component: ComponentInfo): void {
    if (!this.configManager.getConfig().cacheEnabled) {
      return;
    }

    const entry: CacheEntry = {
      data: component,
      lastModified: component.lastModified,
      accessCount: 1,
      lastAccessed: new Date()
    };

    this.cache.set(component.filePath, entry);
    this.evictIfNeeded();
  }

  public getComponent(filePath: string): ComponentInfo | null {
    if (!this.configManager.getConfig().cacheEnabled) {
      return null;
    }

    const entry = this.cache.get(filePath);
    if (!entry) {
      return null;
    }

    entry.accessCount++;
    entry.lastAccessed = new Date();

    return entry.data;
  }

  public getAllComponents(): ComponentInfo[] {
    if (!this.configManager.getConfig().cacheEnabled) {
      return [];
    }

    return Array.from(this.cache.values()).map(entry => entry.data);
  }

  public invalidateComponent(filePath: string): void {
    this.cache.delete(filePath);
  }

  public invalidateAll(): void {
    this.cache.clear();
  }

  public isValid(filePath: string, lastModified: Date): boolean {
    const entry = this.cache.get(filePath);
    if (!entry) {
      return false;
    }

    return entry.lastModified >= lastModified;
  }

  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxSize) {
      return;
    }

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());

    const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.1)); // Remove 10%
    for (const [filePath] of toRemove) {
      this.cache.delete(filePath);
    }
  }

  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      totalAccesses: Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0)
    };
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;

    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    return totalAccesses / entries.length;
  }
}
