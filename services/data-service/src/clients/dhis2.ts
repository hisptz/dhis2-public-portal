import axios from "axios";
import { config } from "dotenv";
import { env } from "@/env";
import { DataServiceConfig } from "@packages/shared/schemas";

config();

export const dhis2Client = axios.create({
	baseURL: `${env.DHIS2_BASE_URL}/api/`,
	headers: {
		Accept: "application/json",
		Authorization: `ApiToken ${env.DHIS2_PAT}`,
	},
});

export function createDownloadClient({
	config,
}: {
	config: DataServiceConfig;
}) {
	return axios.create({
		baseURL: `${env.DHIS2_BASE_URL}/api/routes/${config.source.routeId}/run`,
		headers: {
			Accept: "application/json",
			Authorization: `ApiToken ${env.DHIS2_PAT}`,
		},
	});
}

export function getDHIS2ClientByPAT({
	pat,
	baseURL,
}: {
	baseURL: string;
	pat: string;
}) {
	return axios.create({
		baseURL: `${baseURL}/api/`,
		headers: {
			Accept: "application/json",
			Authorization: `ApiToken ${pat}`,
		},
	});
}

export function getDHIS2ClientByBasicAuth({
	username,
	password,
	baseURL,
}: {
	baseURL: string;
	username: string;
	password: string;
}) {
	return axios.create({
		baseURL: `${baseURL}/api/`,
		auth: {
			username,
			password,
		},
		headers: {
			Accept: "application/json",
		},
	});
}
