import { HttpError } from "./HttpError.js";
import type { IHttpClient, RequestConfig } from "./IHttpClient.js";

/**
 * Configuration for FetchHttpClient
 */
export interface FetchHttpClientConfig {
	/**
	 * Default timeout for all requests in milliseconds
	 * @default 30000 (30 seconds)
	 */
	defaultTimeout?: number;

	/**
	 * Default number of retries for failed requests
	 * @default 3
	 */
	defaultRetries?: number;

	/**
	 * Base delay for exponential backoff in milliseconds
	 * @default 1000 (1 second)
	 */
	retryDelay?: number;

	/**
	 * Enable request/response logging
	 * @default false
	 */
	enableLogging?: boolean;

	/**
	 * Custom logger function
	 */
	logger?: (message: string, context?: Record<string, unknown>) => void;
}

/**
 * HTTP Client implementation using the Fetch API
 *
 * Features:
 * - Automatic retry logic with exponential backoff
 * - Timeout handling with AbortController
 * - Error transformation to domain errors (HttpError)
 * - Request/response logging (optional)
 * - Query parameter serialization
 *
 * @example
 * ```typescript
 * const client = new FetchHttpClient({
 *   defaultTimeout: 10000,
 *   defaultRetries: 3,
 *   enableLogging: true
 * });
 *
 * // GET with query params
 * const users = await client.get<User[]>('https://api.example.com/users', {
 *   params: { page: 1, limit: 10 }
 * });
 *
 * // POST with authorization
 * const result = await client.post<CreateResult>(
 *   'https://api.example.com/items',
 *   { name: 'Item', price: 100 },
 *   { headers: { 'Authorization': 'Bearer token' } }
 * );
 * ```
 */
export class FetchHttpClient implements IHttpClient {
	private readonly config: Required<FetchHttpClientConfig>;

	constructor(config: FetchHttpClientConfig = {}) {
		this.config = {
			defaultTimeout: config.defaultTimeout ?? 30000,
			defaultRetries: config.defaultRetries ?? 3,
			retryDelay: config.retryDelay ?? 1000,
			enableLogging: config.enableLogging ?? false,
			logger:
				config.logger ??
				((message: string, context?: Record<string, unknown>) => {
					console.log(`[FetchHttpClient] ${message}`, context || "");
				}),
		};
	}

	/**
	 * Perform a GET request
	 */
	async get<T>(url: string, config?: RequestConfig): Promise<T> {
		return this.request<T>("GET", url, undefined, config);
	}

	/**
	 * Perform a POST request
	 */
	async post<T>(
		url: string,
		data: unknown,
		config?: RequestConfig,
	): Promise<T> {
		return this.request<T>("POST", url, data, config);
	}

	/**
	 * Perform a PUT request
	 */
	async put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T> {
		return this.request<T>("PUT", url, data, config);
	}

	/**
	 * Perform a DELETE request
	 */
	async delete<T>(url: string, config?: RequestConfig): Promise<T> {
		return this.request<T>("DELETE", url, undefined, config);
	}

	/**
	 * Internal request method with retry logic
	 */
	private async request<T>(
		method: string,
		url: string,
		data?: unknown,
		config?: RequestConfig,
	): Promise<T> {
		const timeout = config?.timeout ?? this.config.defaultTimeout;
		const retries = config?.retries ?? this.config.defaultRetries;
		const fullUrl = this.buildUrl(url, config?.params);

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				// Log attempt
				if (this.config.enableLogging && attempt > 0) {
					this.config.logger(
						`Retry attempt ${attempt}/${retries} for ${method} ${fullUrl}`,
					);
				}

				// Make the request
				const result = await this.executeRequest<T>(
					method,
					fullUrl,
					data,
					timeout,
					config,
				);

				// Log success
				if (this.config.enableLogging) {
					this.config.logger(`${method} ${fullUrl} succeeded`, {
						attempt: attempt + 1,
					});
				}

				return result;
			} catch (error) {
				lastError = error as Error;

				// Don't retry on certain errors
				if (
					error instanceof HttpError &&
					(error.code === "HTTP_ABORTED" || error.code === "HTTP_STATUS_ERROR")
				) {
					// Check if status code is retryable (5xx or 429)
					const statusCode = error.context?.statusCode as number | undefined;
					if (statusCode && statusCode >= 500) {
						// Retry on 5xx errors
					} else if (statusCode === 429) {
						// Retry on rate limit
					} else {
						// Don't retry on 4xx errors (client errors)
						throw error;
					}
				}

				// If this was the last attempt, throw
				if (attempt === retries) {
					throw HttpError.retriesFailed(fullUrl, retries + 1, lastError);
				}

				// Wait before retry with exponential backoff
				const delay = this.config.retryDelay * 2 ** attempt;
				await this.sleep(delay);
			}
		}

		// This should never be reached, but TypeScript needs it
		throw HttpError.retriesFailed(
			fullUrl,
			retries + 1,
			lastError || new Error("Unknown error"),
		);
	}

	/**
	 * Execute a single HTTP request with timeout
	 */
	private async executeRequest<T>(
		method: string,
		url: string,
		data?: unknown,
		timeout?: number,
		config?: RequestConfig,
	): Promise<T> {
		// Create AbortController for timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		// Combine signals if provided
		const signal = controller.signal;
		if (config?.signal) {
			// If external signal is already aborted, abort immediately
			if (config.signal.aborted) {
				throw HttpError.aborted(url);
			}

			// Listen to external signal
			config.signal.addEventListener("abort", () => {
				controller.abort();
			});
		}

		try {
			// Prepare request options
			const options: RequestInit = {
				method,
				signal,
				headers: {
					"Content-Type": "application/json",
					...config?.headers,
				},
			};

			// Add body for POST/PUT
			if (data !== undefined && (method === "POST" || method === "PUT")) {
				options.body = JSON.stringify(data);
			}

			// Log request
			if (this.config.enableLogging) {
				this.config.logger(`${method} ${url}`, {
					headers: options.headers,
					body: data,
				});
			}

			// Make the request
			const response = await fetch(url, options);

			// Clear timeout
			clearTimeout(timeoutId);

			// Check if response is ok
			if (!response.ok) {
				let responseBody: unknown;
				try {
					responseBody = await response.json();
				} catch {
					responseBody = await response.text();
				}

				throw HttpError.statusCode(
					url,
					method,
					response.status,
					response.statusText,
					responseBody,
				);
			}

			// Parse response
			const contentType = response.headers.get("content-type");
			let result: T;

			if (contentType?.includes("application/json")) {
				result = (await response.json()) as T;
			} else {
				// For non-JSON responses, return text as T
				result = (await response.text()) as T;
			}

			// Log response
			if (this.config.enableLogging) {
				this.config.logger(`${method} ${url} response`, {
					status: response.status,
					body: result,
				});
			}

			return result;
		} catch (error) {
			clearTimeout(timeoutId);

			// Handle abort
			if ((error as Error).name === "AbortError") {
				if (config?.signal?.aborted) {
					throw HttpError.aborted(url);
				}
				throw HttpError.timeout(url, timeout || this.config.defaultTimeout);
			}

			// Handle network errors
			if (error instanceof TypeError) {
				throw HttpError.networkError(url, error);
			}

			// Re-throw HttpError
			if (error instanceof HttpError) {
				throw error;
			}

			// Wrap other errors
			throw HttpError.networkError(url, error as Error);
		}
	}

	/**
	 * Build URL with query parameters
	 */
	private buildUrl(
		url: string,
		params?: Record<string, string | number | boolean>,
	): string {
		if (!params || Object.keys(params).length === 0) {
			return url;
		}

		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			searchParams.append(key, String(value));
		}

		const separator = url.includes("?") ? "&" : "?";
		return `${url}${separator}${searchParams.toString()}`;
	}

	/**
	 * Sleep for a given number of milliseconds
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
