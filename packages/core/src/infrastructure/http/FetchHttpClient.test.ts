import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FetchHttpClient } from "./FetchHttpClient.js";
import { HttpError } from "./HttpError.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("FetchHttpClient", () => {
	let client: FetchHttpClient;

	beforeEach(() => {
		client = new FetchHttpClient({
			defaultTimeout: 5000,
			defaultRetries: 2,
			retryDelay: 100,
			enableLogging: false,
		});

		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("GET requests", () => {
		it("should make a successful GET request", async () => {
			const mockResponse = { id: 1, name: "Test" };
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => mockResponse,
			});

			const result = await client.get<typeof mockResponse>(
				"https://api.example.com/users/1",
			);

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledTimes(1);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/users/1",
				expect.objectContaining({
					method: "GET",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
					}),
				}),
			);
		});

		it("should handle query parameters", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => [],
			});

			await client.get("https://api.example.com/users", {
				params: { page: 1, limit: 10, active: true },
			});

			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/users?page=1&limit=10&active=true",
				expect.any(Object),
			);
		});

		it("should include custom headers", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => ({}),
			});

			await client.get("https://api.example.com/users", {
				headers: { Authorization: "Bearer token123" },
			});

			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/users",
				expect.objectContaining({
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						Authorization: "Bearer token123",
					}),
				}),
			);
		});
	});

	describe("POST requests", () => {
		it("should make a successful POST request", async () => {
			const requestData = { name: "John", email: "john@example.com" };
			const mockResponse = { id: 1, ...requestData };

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 201,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => mockResponse,
			});

			const result = await client.post<typeof mockResponse>(
				"https://api.example.com/users",
				requestData,
			);

			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/users",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify(requestData),
				}),
			);
		});

		it("should send JSON body", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => ({}),
			});

			const data = { foo: "bar", nested: { value: 123 } };
			await client.post("https://api.example.com/data", data);

			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/data",
				expect.objectContaining({
					body: JSON.stringify(data),
				}),
			);
		});
	});

	describe("PUT requests", () => {
		it("should make a successful PUT request", async () => {
			const updateData = { name: "Updated Name" };
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => updateData,
			});

			const result = await client.put<typeof updateData>(
				"https://api.example.com/users/1",
				updateData,
			);

			expect(result).toEqual(updateData);
			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/users/1",
				expect.objectContaining({
					method: "PUT",
					body: JSON.stringify(updateData),
				}),
			);
		});
	});

	describe("DELETE requests", () => {
		it("should make a successful DELETE request", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 204,
				headers: new Headers({ "content-type": "text/plain" }),
				text: async () => "",
			});

			await client.delete("https://api.example.com/users/1");

			expect(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/users/1",
				expect.objectContaining({
					method: "DELETE",
				}),
			);
		});
	});

	describe("Error Handling", () => {
		it("should throw HttpError for 404 status", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: false,
				status: 404,
				statusText: "Not Found",
				headers: new Headers(),
				text: async () => "User not found",
			});

			try {
				await client.get("https://api.example.com/users/999");
				expect.fail("Should have thrown HttpError");
			} catch (error) {
				expect(error).toBeInstanceOf(HttpError);
				expect((error as HttpError).code).toBe("HTTP_STATUS_ERROR");
				expect((error as HttpError).context?.statusCode).toBe(404);
			}

			// Should not retry 404
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});

		it("should throw HttpError for 500 status and retry", async () => {
			(global.fetch as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					statusText: "Internal Server Error",
					headers: new Headers(),
					text: async () => "Server error",
				})
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					statusText: "Internal Server Error",
					headers: new Headers(),
					text: async () => "Server error",
				})
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					statusText: "Internal Server Error",
					headers: new Headers(),
					text: async () => "Server error",
				});

			await expect(client.get("https://api.example.com/users")).rejects.toThrow(
				HttpError,
			);

			// Should retry 2 times (total 3 attempts for defaultRetries: 2)
			expect(global.fetch).toHaveBeenCalledTimes(3);
		});

		it("should handle network errors", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
				new TypeError("Failed to fetch"),
			);

			await expect(client.get("https://api.example.com/users")).rejects.toThrow(
				HttpError,
			);

			await expect(
				client.get("https://api.example.com/users"),
			).rejects.toMatchObject({
				code: "HTTP_RETRIES_FAILED",
			});
		});

		it("should handle timeout", async () => {
			// Mock a slow response
			(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						setTimeout(
							() =>
								resolve({
									ok: true,
									headers: new Headers(),
									json: async () => ({}),
								}),
							10000,
						); // 10 seconds
					}),
			);

			// Use very short timeout
			await expect(
				client.get("https://api.example.com/slow", { timeout: 100 }),
			).rejects.toThrow(HttpError);

			await expect(
				client.get("https://api.example.com/slow", { timeout: 100 }),
			).rejects.toMatchObject({
				code: "HTTP_RETRIES_FAILED",
			});
		}, 15000); // Test timeout of 15 seconds

		it("should handle aborted requests", async () => {
			const controller = new AbortController();

			// Mock fetch to abort immediately
			(global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
				controller.abort();
				return Promise.reject(new DOMException("Aborted", "AbortError"));
			});

			await expect(
				client.get("https://api.example.com/users", {
					signal: controller.signal,
				}),
			).rejects.toThrow(HttpError);

			await expect(
				client.get("https://api.example.com/users", {
					signal: controller.signal,
				}),
			).rejects.toMatchObject({
				code: "HTTP_ABORTED",
			});
		});
	});

	describe("Retry Logic", () => {
		it("should retry on 500 errors", async () => {
			(global.fetch as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					statusText: "Internal Server Error",
					headers: new Headers(),
					text: async () => "Error",
				})
				.mockResolvedValueOnce({
					ok: true,
					headers: new Headers({ "content-type": "application/json" }),
					json: async () => ({ success: true }),
				});

			const result = await client.get<{ success: boolean }>(
				"https://api.example.com/users",
			);

			expect(result).toEqual({ success: true });
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it("should retry on 429 (rate limit)", async () => {
			(global.fetch as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({
					ok: false,
					status: 429,
					statusText: "Too Many Requests",
					headers: new Headers(),
					text: async () => "Rate limited",
				})
				.mockResolvedValueOnce({
					ok: true,
					headers: new Headers({ "content-type": "application/json" }),
					json: async () => ({ success: true }),
				});

			const result = await client.get<{ success: boolean }>(
				"https://api.example.com/users",
			);

			expect(result).toEqual({ success: true });
			expect(global.fetch).toHaveBeenCalledTimes(2);
		});

		it("should not retry on 400 (bad request)", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: "Bad Request",
				headers: new Headers(),
				text: async () => "Invalid data",
			});

			await expect(client.get("https://api.example.com/users")).rejects.toThrow(
				HttpError,
			);

			// Should not retry
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});

		it("should not retry on 401 (unauthorized)", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
				headers: new Headers(),
				text: async () => "Invalid token",
			});

			await expect(client.get("https://api.example.com/users")).rejects.toThrow(
				HttpError,
			);

			// Should not retry
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});

		it("should respect custom retry count", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				headers: new Headers(),
				text: async () => "Error",
			});

			await expect(
				client.get("https://api.example.com/users", { retries: 0 }),
			).rejects.toThrow(HttpError);

			// Should try only once (no retries)
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("Response Parsing", () => {
		it("should parse JSON responses", async () => {
			const mockData = { id: 1, name: "Test" };
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => mockData,
			});

			const result = await client.get<typeof mockData>(
				"https://api.example.com/data",
			);

			expect(result).toEqual(mockData);
		});

		it("should parse text responses", async () => {
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				headers: new Headers({ "content-type": "text/plain" }),
				text: async () => "Plain text response",
			});

			const result = await client.get<string>("https://api.example.com/text");

			expect(result).toBe("Plain text response");
		});

		it("should handle JSON errors in response body", async () => {
			const errorBody = { error: "Validation failed", fields: ["email"] };
			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 422,
				statusText: "Unprocessable Entity",
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => errorBody,
			});

			await expect(
				client.post("https://api.example.com/users", { email: "invalid" }),
			).rejects.toMatchObject({
				code: "HTTP_STATUS_ERROR",
				context: expect.objectContaining({
					response: errorBody,
				}),
			});
		});
	});

	describe("Configuration", () => {
		it("should use default timeout", async () => {
			const clientWithDefaults = new FetchHttpClient();
			// Access private config through any
			const config = (clientWithDefaults as any).config;

			expect(config.defaultTimeout).toBe(30000); // 30 seconds
			expect(config.defaultRetries).toBe(3);
		});

		it("should allow custom configuration", async () => {
			const customClient = new FetchHttpClient({
				defaultTimeout: 5000,
				defaultRetries: 5,
				retryDelay: 500,
			});

			const config = (customClient as any).config;

			expect(config.defaultTimeout).toBe(5000);
			expect(config.defaultRetries).toBe(5);
			expect(config.retryDelay).toBe(500);
		});

		it("should log requests when logging is enabled", async () => {
			const mockLogger = vi.fn();
			const loggingClient = new FetchHttpClient({
				enableLogging: true,
				logger: mockLogger,
			});

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				status: 200,
				headers: new Headers({ "content-type": "application/json" }),
				json: async () => ({ data: "test" }),
			});

			await loggingClient.get("https://api.example.com/test");

			expect(mockLogger).toHaveBeenCalled();
		});
	});
});
