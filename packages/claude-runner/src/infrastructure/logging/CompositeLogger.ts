import type { ILogger, LogEntry } from "./ILogger.js";

export class CompositeLogger implements ILogger {
	constructor(private readonly loggers: ILogger[]) {}

	async log(entry: LogEntry): Promise<void> {
		await Promise.all(this.loggers.map((logger) => logger.log(entry)));
	}

	async close(): Promise<void> {
		await Promise.all(this.loggers.map((logger) => logger.close()));
	}
}
