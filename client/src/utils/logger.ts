interface LogEntry {
  page: string;
  input: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
}

class Logger {
  private static readonly LOGS_KEY = 'user_input_logs';
  private static readonly MAX_LOGS = 1000;

  static logInput(page: string, input: Record<string, unknown>): void {
    if (!input || Object.keys(input).length === 0) {
      return;
    }

    const logEntry: LogEntry = {
      page,
      input: this.sanitizeInput(input),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    const logs = this.getLogs();
    logs.push(logEntry);

    if (logs.length > this.MAX_LOGS) {
      logs.shift();
    }

    localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
  }

  private static sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = value.substring(0, 1000);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private static getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.LOGS_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  static getLogsForDate(date: string): LogEntry[] {
    const logs = this.getLogs();
    return logs.filter(log => log.timestamp.startsWith(date));
  }

  static clearLogs(): void {
    localStorage.removeItem(this.LOGS_KEY);
  }
}

export default Logger;
