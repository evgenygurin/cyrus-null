import { CyrusError } from "../../errors/CyrusError.js";

/**
 * HTTP Error
 *
 * Represents errors that occur during HTTP requests.
 * Extends CyrusError to fit into the domain error hierarchy.
 *
 * @example
 * ```typescript
 * throw new HttpError('Request failed', 'HTTP_REQUEST_FAILED', {
 *   url: 'https://api.example.com/endpoint',
 *   method: 'GET',
 *   statusCode: 500,
 *   response: 'Internal Server Error'
 * });
 * ```
 */
export class HttpError extends CyrusError {
	constructor(
		message: string,
		code: string = "HTTP_ERROR",
		context?: Record<string, unknown>,
	) {
		super(message, code, context);
		this.name = "HttpError";
	}

	/**
	 * Create an error for timeout
	 */
	static timeout(url: string, timeout: number): HttpError {
		return new HttpError(
			`Request timed out after ${timeout}ms`,
			"HTTP_TIMEOUT",
			{ url, timeout },
		);
	}

	/**
	 * Create an error for network failure
	 */
	static networkError(url: string, originalError: Error): HttpError {
		return new HttpError(
			`Network error: ${originalError.message}`,
			"HTTP_NETWORK_ERROR",
			{ url, originalError: originalError.message },
		);
	}

	/**
	 * Create an error for HTTP status codes
	 */
	static statusCode(
		url: string,
		method: string,
		statusCode: number,
		statusText: string,
		responseBody?: unknown,
	): HttpError {
		return new HttpError(
			`HTTP ${statusCode} ${statusText}`,
			"HTTP_STATUS_ERROR",
			{ url, method, statusCode, statusText, response: responseBody },
		);
	}

	/**
	 * Create an error for aborted requests
	 */
	static aborted(url: string): HttpError {
		return new HttpError("Request was aborted", "HTTP_ABORTED", { url });
	}

	/**
	 * Create an error for failed retries
	 */
	static retriesFailed(
		url: string,
		attempts: number,
		lastError: Error,
	): HttpError {
		return new HttpError(
			`Request failed after ${attempts} retries: ${lastError.message}`,
			"HTTP_RETRIES_FAILED",
			{ url, attempts, lastError: lastError.message },
		);
	}
}
