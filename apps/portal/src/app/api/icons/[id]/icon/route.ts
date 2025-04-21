import { NextRequest } from "next/server";
import { dhis2HttpClient } from "@/utils/api/dhis2";

export async function GET(request: NextRequest) {
	const url = request.url as string;

	const urlToForward = url
		.substring(url.lastIndexOf("/api/"))
		.replace("/api/", "");

	console.log("Getting an icon: ", urlToForward, "");

	return await dhis2HttpClient.getIcon(urlToForward);
}
