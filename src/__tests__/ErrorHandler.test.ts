import { ErrorHandler } from '../utils/ErrorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('Error handling', () => {
    it('should handle errors with context', () => {
      const error = new Error('Test error');
      const context = {
        operation: 'test_operation',
        filePath: '/test/path',
        timestamp: new Date()
      };

      expect(() => {
        errorHandler.handleError(error, context, 'low');
      }).not.toThrow();

      const errors = errorHandler.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].error.message).toBe('Test error');
      expect(errors[0].context.operation).toBe('test_operation');
      expect(errors[0].severity).toBe('low');
    });

    it('should throw critical non-recoverable errors', () => {
      const error = new Error('Critical error');
      const context = {
        operation: 'critical_operation',
        timestamp: new Date()
      };

      expect(() => {
        errorHandler.handleError(error, context, 'critical');
      }).toThrow('Critical error');
    });

    it('should not throw recoverable errors', () => {
      const error = new Error('ENOENT: file not found');
      const context = {
        operation: 'file_read',
        timestamp: new Date()
      };

      expect(() => {
        errorHandler.handleError(error, context, 'medium');
      }).not.toThrow();
    });
  });

  describe('Error filtering', () => {
    beforeEach(() => {
      const context = { operation: 'test', timestamp: new Date() };
      
      errorHandler.handleError(new Error('Low error'), context, 'low');
      errorHandler.handleError(new Error('Medium error'), context, 'medium');
      errorHandler.handleError(new Error('High error'), context, 'high');
    });

    it('should filter errors by severity', () => {
      const lowErrors = errorHandler.getErrors('low');
      const mediumErrors = errorHandler.getErrors('medium');
      const highErrors = errorHandler.getErrors('high');

      expect(lowErrors).toHaveLength(1);
      expect(mediumErrors).toHaveLength(1);
      expect(highErrors).toHaveLength(1);
      
      expect(lowErrors[0].severity).toBe('low');
      expect(mediumErrors[0].severity).toBe('medium');
      expect(highErrors[0].severity).toBe('high');
    });

    it('should return all errors when no severity filter', () => {
      const allErrors = errorHandler.getErrors();
      expect(allErrors).toHaveLength(3);
    });
  });

  describe('Error summary', () => {
    it('should provide correct error summary', () => {
      const context = { operation: 'test', timestamp: new Date() };
      
      errorHandler.handleError(new Error('ENOENT error'), context, 'low');
      errorHandler.handleError(new Error('Syntax error'), context, 'medium');
      errorHandler.handleError(new Error('Permission denied'), context, 'high');

      const summary = errorHandler.getErrorSummary();
      
      expect(summary.total).toBe(3);
      expect(summary.low).toBe(1);
      expect(summary.medium).toBe(1);
      expect(summary.high).toBe(1);
      expect(summary.critical).toBe(0);
      expect(summary.recoverable).toBe(3);
      expect(summary.unrecoverable).toBe(0);
    });
  });

  describe('Error management', () => {
    it('should clear all errors', () => {
      const context = { operation: 'test', timestamp: new Date() };
      errorHandler.handleError(new Error('Test'), context, 'low');
      
      expect(errorHandler.hasErrors()).toBe(true);
      
      errorHandler.clearErrors();
      
      expect(errorHandler.hasErrors()).toBe(false);
      expect(errorHandler.getErrors()).toHaveLength(0);
    });

    it('should check for errors by severity', () => {
      const context = { operation: 'test', timestamp: new Date() };
      errorHandler.handleError(new Error('Test'), context, 'high');
      
      expect(errorHandler.hasErrors('high')).toBe(true);
      expect(errorHandler.hasErrors('critical')).toBe(false);
    });
  });
});
