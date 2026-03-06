type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function formatLog(payload: LogPayload): string {
  return JSON.stringify({
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  });
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(formatLog({ level: "info", message, timestamp: new Date().toISOString(), ...meta }));
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(formatLog({ level: "warn", message, timestamp: new Date().toISOString(), ...meta }));
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(formatLog({ level: "error", message, timestamp: new Date().toISOString(), ...meta }));
  },
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLog({ level: "debug", message, timestamp: new Date().toISOString(), ...meta }));
    }
  },
};
