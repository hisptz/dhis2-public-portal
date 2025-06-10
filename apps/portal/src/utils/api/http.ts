import { ConnectionStatus } from "@/types/connection";

export class D2HttpClient {
	baseURL: URL;
	pat: string;

	constructor(baseURL: string, pat: string) {
		this.baseURL = D2HttpClient.sanitizeURL(baseURL);
		console.log(this.baseURL.toString());
		this.pat = pat;
	}

	static sanitizeURL(baseURL: string): URL {
		if (baseURL.endsWith("/api") || baseURL.endsWith("/api/")) {
			if (baseURL.endsWith("/")) {
				return new URL(baseURL);
			}
			return new URL(`${baseURL}/`);
		}
		if (baseURL.endsWith("/")) {
			return new URL("api/", baseURL);
		}
		return new URL("api/", `${baseURL}/`);
	}

	async getIcon(path: string) {
		const url = new URL(`${path}`, this.baseURL);
		const response = await fetch(url, {
			cache: "force-cache",
			headers: {
				Authorization: `ApiToken ${this.pat}`,
				Accept: "application/octet-stream;charset=utf-8",
			},
		});

		const status = response.status;
		if (status >= 400) {
			throw `Request failed with status code ${status}`;
		}

		const blob = await response.blob();
		return new Response(blob, {
			headers: {
				...response.headers,
			},
		});
	}

	async getRaw(path: string) {
		const url = new URL(`${path}`, this.baseURL);
		const response = await fetch(url, {
			cache: "default",
			headers: {
				Authorization: `ApiToken ${this.pat}`,
			},
		});
		const status = response.status;
		if (status >= 400) {
			console.error(await response.json());
			throw `Request failed with status code ${status}`;
		}
		return response;
	}

	/*
	 * This is used to verify the following
	 * The BASE URL is valid and accessible
	 * The AUTH token is valid
	 *
	 * Additional checks:
	 * TODO: Check if the DHIS2 instance is supported
	 * TODO: Verify if the token has correct authorities
	 *  TODO: Check if the token does not access potentially dangerous authorities
	 *
	 * */
	async verifyClient(): Promise<ConnectionStatus> {
		const url = `system/info`;
		try {
			const response = await this.get<{
				version: string;
				systemName: string;
			}>(url);
			return {
				status: "OK",
				version: response?.version,
				name: response?.systemName,
			};
		} catch (e) {
			console.error(`DHIS2 client verification failed!`);
			if (typeof e === "object") {
				if ("httpStatusCode" in e!) {
					const code = e.httpStatusCode;

					switch (code) {
						case 400:
							return {
								status: "ERROR",
								title: "Invalid credentials",
								message:
									"Could not access DHIS2 instance. Please verify your credentials and try again.",
							};
						case 404:
							return {
								status: "ERROR",
								title: "Invalid DHIS2 URL",
								message:
									"Could not access DHIS2 instance. Please verify the provided DHIS2 URL is correct and try again.",
							};
					}
				}
			}

			if (e instanceof Error) {
				return {
					status: "ERROR",
					title: "Invalid DHIS2 connection",
					message:
						"Could not access the DHIS2 instance. verify the provided DHIS2 URL is correct and try again.",
				};
			}

			return {
				status: "ERROR",
				title: "Unknown error",
				message:
					"Could not access DHIS2 instance due to an unknown error. Please view the server logs for more details.",
			};
		}
	}

	async getFile(
		path: string,
		meta?: {
			params?: { [key: string]: string };
		},
	) {
		const { params } = meta ?? {};
		const url = new URL(`${path}`, this.baseURL);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		const detailsUrl = path.replace("/data", "");

		const details = await this.get<{ name: string; url: string }>(
			detailsUrl,
		);
		if (details == null) {
			return;
		}
		const fileDetails = await this.get<{ name: string }>(
			`fileResources/${details.url}`,
		);

		const response = await fetch(url, {
			cache: "force-cache",
			headers: {
				Authorization: `ApiToken ${this.pat}`,
				Accept: "application/octet-stream;charset=utf-8",
			},
		});

		const status = response.status;

		if (status >= 400) {
			console.error(await response.json());
			throw `Request failed with status code ${status}`;
		}

		const blob = await response.blob();
		return new Response(blob, {
			headers: {
				...response.headers,
				"content-disposition": `attachment; filename="${fileDetails?.name}"`,
			},
		});
	}

	async get<T>(
		path: string,
		meta?: {
			params?: { [key: string]: string };
		},
	) {
		// try {
		const { params } = meta ?? {};
		const url = new URL(`${path}`, this.baseURL);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		const response = await fetch(url, {
			cache: "no-store",
			headers: {
				Authorization: `ApiToken ${this.pat}`,
			},
		});
		const status = response.status;

		if (status >= 400) {
			console.error(
				`API call to ${url} failed with status code ${status}`,
			);
			let errorDetails;
			try {
				errorDetails = await response.json();
			} catch (e) {
				errorDetails = response;
			}
			throw errorDetails;
		}
		return (await response.json()) as T;
		//
	}

	async post<T, R>(
		path: string,
		body?: T,
		meta?: {
			params?: { [key: string]: string };
		},
	) {
		const { params } = meta ?? {};
		const url = new URL(`${path}`, this.baseURL);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Authorization": `ApiToken ${this.pat}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const status = response.status;
		if (status >= 400) {
			throw `Request failed with status code ${status}`;
		}
		return (await response.json()) as R;
	}

	async put<T, R>(
		path: string,
		body?: T,
		meta?: {
			params?: { [key: string]: string };
		},
	) {
		const { params } = meta ?? {};
		const url = new URL(`${path}`, this.baseURL);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				"Authorization": `ApiToken ${this.pat}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const status = response.status;
		if (status >= 400) {
			throw `Request failed with status code ${status}`;
		}
		return (await response.json()) as R;
	}

	async postFeedback<T>(
		path: string,
		meta?: { params?: { [key: string]: string } },
		p0?: {
			params: { recipients: string; subject: string; message: string };
		},
	) {
		const { params } = meta ?? {};
		const url = new URL(`${path}`, this.baseURL);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `ApiToken ${this.pat}`,
			},
			body: "",
		});

		const status = response.status;

		if (status >= 400) {
			console.error(await response.json());
			throw `Request failed with status code ${status}`;
		}

		return (await response.json()) as T;
	}
}
