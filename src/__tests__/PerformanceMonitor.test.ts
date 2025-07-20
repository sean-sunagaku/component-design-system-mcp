import { PerformanceMonitor } from '../utils/PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('Timer functionality', () => {
    it('should start and end timers correctly', () => {
      monitor.startTimer('test');
      
      setTimeout(() => {
        const duration = monitor.endTimer('test');
        expect(duration).toBeGreaterThan(0);
      }, 10);
    });

    it('should throw error for non-existent timer', () => {
      expect(() => monitor.endTimer('nonexistent')).toThrow("Timer 'nonexistent' was not started");
    });

    it('should update scan time when ending scan timer', () => {
      monitor.startTimer('scan');
      const duration = monitor.endTimer('scan');
      
      const metrics = monitor.getMetrics();
      expect(metrics.scanTime).toBe(duration);
    });

    it('should update analysis time when ending analysis timer', () => {
      monitor.startTimer('analysis');
      const duration = monitor.endTimer('analysis');
      
      const metrics = monitor.getMetrics();
      expect(metrics.analysisTime).toBe(duration);
    });
  });

  describe('Metrics tracking', () => {
    it('should update cache hit rate', () => {
      monitor.updateCacheHitRate(0.75);
      
      const metrics = monitor.getMetrics();
      expect(metrics.cacheHitRate).toBe(0.75);
    });

    it('should increment component count', () => {
      monitor.incrementComponentCount();
      monitor.incrementComponentCount();
      
      const metrics = monitor.getMetrics();
      expect(metrics.componentCount).toBe(2);
    });

    it('should increment error count', () => {
      monitor.incrementErrorCount();
      monitor.incrementErrorCount();
      monitor.incrementErrorCount();
      
      const metrics = monitor.getMetrics();
      expect(metrics.errorCount).toBe(3);
    });

    it('should update memory usage', () => {
      monitor.updateMemoryUsage();
      
      const metrics = monitor.getMetrics();
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all metrics', () => {
      monitor.incrementComponentCount();
      monitor.incrementErrorCount();
      monitor.updateCacheHitRate(0.5);
      
      monitor.reset();
      
      const metrics = monitor.getMetrics();
      expect(metrics.componentCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.cacheHitRate).toBe(0);
      expect(metrics.scanTime).toBe(0);
      expect(metrics.analysisTime).toBe(0);
    });
  });

  describe('Logging', () => {
    it('should log metrics without throwing', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      monitor.logMetrics();
      
      expect(consoleSpy).toHaveBeenCalledWith('Performance Metrics:', expect.any(Object));
      consoleSpy.mockRestore();
    });
  });
});
