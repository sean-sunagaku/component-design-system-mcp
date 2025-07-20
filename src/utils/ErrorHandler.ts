export interface ErrorContext {
  operation: string;
  filePath?: string;
  componentName?: string;
  framework?: string;
  timestamp: Date;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

export class ErrorHandler {
  private errors: ErrorReport[] = [];
  private maxErrors: number = 100;

  public handleError(
    error: Error,
    context: ErrorContext,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    const recoverable = this.isRecoverable(error, severity);
    
    const report: ErrorReport = {
      error,
      context,
      severity,
      recoverable
    };

    this.errors.push(report);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    this.logError(report);

    if (severity === 'critical' && !recoverable) {
      throw error;
    }
  }

  private isRecoverable(error: Error, severity: string): boolean {
    if (severity === 'critical') return false;
    
    const recoverablePatterns = [
      /ENOENT/,
      /permission denied/i,
      /syntax error/i,
      /parse error/i,
      /timeout/i
    ];

    return recoverablePatterns.some(pattern => pattern.test(error.message));
  }

  private logError(report: ErrorReport): void {
    const { error, context, severity } = report;
    
    const logLevel = severity === 'critical' ? 'error' : 
                    severity === 'high' ? 'error' :
                    severity === 'medium' ? 'warn' : 'info';

    console[logLevel](`[${severity.toUpperCase()}] ${context.operation}:`, {
      message: error.message,
      filePath: context.filePath,
      componentName: context.componentName,
      framework: context.framework,
      stack: error.stack,
      timestamp: context.timestamp
    });
  }

  public getErrors(severity?: string): ErrorReport[] {
    if (severity) {
      return this.errors.filter(e => e.severity === severity);
    }
    return [...this.errors];
  }

  public getErrorSummary(): Record<string, number> {
    const summary: Record<string, number> = {
      total: this.errors.length,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
      recoverable: 0,
      unrecoverable: 0
    };

    for (const error of this.errors) {
      summary[error.severity]++;
      if (error.recoverable) {
        summary.recoverable++;
      } else {
        summary.unrecoverable++;
      }
    }

    return summary;
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public hasErrors(severity?: string): boolean {
    if (severity) {
      return this.errors.some(e => e.severity === severity);
    }
    return this.errors.length > 0;
  }
}
