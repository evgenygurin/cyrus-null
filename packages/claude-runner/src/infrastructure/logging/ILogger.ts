export interface LogEntry {
	type: string;
	timestamp: string;
	data: unknown;
}

export interface ILogger {
	log(entry: LogEntry): Promise<void>;
	close(): Promise<void>;
}
