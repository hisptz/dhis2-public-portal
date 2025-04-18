import { NextRequest, NextResponse } from "next/server";
import { dhis2HttpClient } from "@/utils/api/dhis2";

export async function GET(request: NextRequest) {
	const url = request.url as string;

	const urlToForward = url
		.substring(url.lastIndexOf("/api/"))
		.replace("/api/", "");

	const response = await dhis2HttpClient.get(urlToForward);

	return NextResponse.json(response);
}
