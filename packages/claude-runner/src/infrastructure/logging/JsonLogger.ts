import { createWriteStream, type WriteStream } from "node:fs";
import type { ILogger, LogEntry } from "./ILogger.js";

export class JsonLogger implements ILogger {
	private stream: WriteStream;

	constructor(filePath: string) {
		this.stream = createWriteStream(filePath, { flags: "a" });
	}

	async log(entry: LogEntry): Promise<void> {
		return new Promise((resolve, reject) => {
			const line = `${JSON.stringify(entry)}\n`;
			this.stream.write(line, (error) => {
				if (error) reject(error);
				else resolve();
			});
		});
	}

	async close(): Promise<void> {
		return new Promise((resolve) => {
			this.stream.end(() => resolve());
		});
	}
}
