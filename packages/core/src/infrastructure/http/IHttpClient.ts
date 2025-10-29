/**
 * HTTP Request Configuration
 */
export interface RequestConfig {
	/**
	 * Custom headers to include in the request
	 */
	headers?: Record<string, string>;

	/**
	 * Request timeout in milliseconds
	 * @default 30000 (30 seconds)
	 */
	timeout?: number;

	/**
	 * Number of retry attempts for failed requests
	 * @default 3
	 */
	retries?: number;

	/**
	 * Signal to abort the request
	 */
	signal?: AbortSignal;

	/**
	 * Query parameters to append to the URL
	 */
	params?: Record<string, string | number | boolean>;
}

/**
 * HTTP Client Interface
 *
 * Provides a standard interface for making HTTP requests with:
 * - Automatic retry logic with exponential backoff
 * - Timeout handling
 * - Error transformation to domain errors
 * - Request/response logging
 *
 * @example
 * ```typescript
 * const client = new FetchHttpClient();
 *
 * // GET request
 * const data = await client.get<User>('https://api.example.com/users/123');
 *
 * // POST request with custom headers
 * const result = await client.post<CreateUserResult>(
 *   'https://api.example.com/users',
 *   { name: 'John', email: 'john@example.com' },
 *   { headers: { 'Authorization': 'Bearer token' } }
 * );
 * ```
 */
export interface IHttpClient {
	/**
	 * Perform a GET request
	 *
	 * @param url - The URL to fetch
	 * @param config - Optional request configuration
	 * @returns Promise resolving to the response data
	 * @throws {HttpError} If the request fails after retries
	 */
	get<T>(url: string, config?: RequestConfig): Promise<T>;

	/**
	 * Perform a POST request
	 *
	 * @param url - The URL to post to
	 * @param data - The data to send in the request body
	 * @param config - Optional request configuration
	 * @returns Promise resolving to the response data
	 * @throws {HttpError} If the request fails after retries
	 */
	post<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;

	/**
	 * Perform a PUT request
	 *
	 * @param url - The URL to put to
	 * @param data - The data to send in the request body
	 * @param config - Optional request configuration
	 * @returns Promise resolving to the response data
	 * @throws {HttpError} If the request fails after retries
	 */
	put<T>(url: string, data: unknown, config?: RequestConfig): Promise<T>;

	/**
	 * Perform a DELETE request
	 *
	 * @param url - The URL to delete
	 * @param config - Optional request configuration
	 * @returns Promise resolving to the response data
	 * @throws {HttpError} If the request fails after retries
	 */
	delete<T>(url: string, config?: RequestConfig): Promise<T>;
}
