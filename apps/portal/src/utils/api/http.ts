export class HttpClient {
	baseURL: string;
	pat: string;

	constructor(baseURL: string, pat: string) {
		this.baseURL = baseURL;
		this.pat = pat;
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
		const fileDetails = await this.get<{ name: string }>(
			`fileResources/${details.url}`,
		);

		const response = await fetch(url, {
			cache: "no-store",
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
				"content-disposition": `attachment; filename="${fileDetails.name}"`,
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
			console.error(await response.json());
			throw `Request failed with status code ${status}`;
		}

		return (await response.json()) as T;
		//
	}

	async post<T>(path: string, meta?: { params?: { [key: string]: string } }) {
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
