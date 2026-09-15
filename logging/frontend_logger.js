class Logger {
    info(message, context = {}) {
        console.info(message, context);
    }

    debug(message, context = {}) {
        console.debug(message, context);
    }

    warn(message, context = {}) {
        console.warn(message, context);
    }

    error(message, context = {}) {
        console.error(message, context);
    }
}

export const logger = new Logger();

// Global error handlers
if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
        logger.error('Unhandled Exception', { message, source, lineno, colno, stack: error?.stack });
    };

    window.onunhandledrejection = (event) => {
        logger.error('Unhandled Promise Rejection', { reason: event.reason });
    };
}
