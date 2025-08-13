export const testDataSource = async ({
	url,
	pat,
	username,
	password,
}: {
	url: string;
	pat?: string;
	username?: string;
	password?: string;
}) => {
	return await fetch(`${url}/api/me.json`, {
		method: "GET",
		headers: {
			Authorization: pat
				? `ApiToken ${pat}`
				: `Basic ${btoa(`${username}:${password}`)}`,
		},
	});
};
