function baseLog(level, message, context = {}) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context
  };

  const serialized = JSON.stringify(payload);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  console.log(serialized);
}

export const logger = {
  info: (message, context) => baseLog('info', message, context),
  warn: (message, context) => baseLog('warn', message, context),
  error: (message, context) => baseLog('error', message, context)
};
