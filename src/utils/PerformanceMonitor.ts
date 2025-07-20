export interface PerformanceMetrics {
  scanTime: number;
  analysisTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  componentCount: number;
  errorCount: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    scanTime: 0,
    analysisTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    componentCount: 0,
    errorCount: 0
  };

  private timers: Map<string, number> = new Map();

  public startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  public endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      throw new Error(`Timer '${name}' was not started`);
    }
    
    const duration = Date.now() - startTime;
    this.timers.delete(name);
    
    if (name === 'scan') {
      this.metrics.scanTime = duration;
    } else if (name === 'analysis') {
      this.metrics.analysisTime = duration;
    }
    
    return duration;
  }

  public updateCacheHitRate(hitRate: number): void {
    this.metrics.cacheHitRate = hitRate;
  }

  public updateMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      this.metrics.memoryUsage = usage.heapUsed / 1024 / 1024; // MB
    }
  }

  public incrementComponentCount(): void {
    this.metrics.componentCount++;
  }

  public incrementErrorCount(): void {
    this.metrics.errorCount++;
  }

  public getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  public reset(): void {
    this.metrics = {
      scanTime: 0,
      analysisTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      componentCount: 0,
      errorCount: 0
    };
    this.timers.clear();
  }

  public logMetrics(): void {
    const metrics = this.getMetrics();
    console.log('Performance Metrics:', {
      'Scan Time': `${metrics.scanTime}ms`,
      'Analysis Time': `${metrics.analysisTime}ms`,
      'Cache Hit Rate': `${(metrics.cacheHitRate * 100).toFixed(1)}%`,
      'Memory Usage': `${metrics.memoryUsage.toFixed(1)}MB`,
      'Components Processed': metrics.componentCount,
      'Errors': metrics.errorCount
    });
  }
}
