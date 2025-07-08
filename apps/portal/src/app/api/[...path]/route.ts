import { NextRequest, NextResponse } from "next/server";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import { notFound } from "next/navigation";

const whitelistedResources =
	/analytics|legendSets|organisationUnits|geoFeatures|tokens\/google/;

export async function GET(request: NextRequest) {
	const url = request.url as string;

	const urlToForward = url
		.substring(url.lastIndexOf("/api/"))
		.replace("/api/", "");

	if (!whitelistedResources.test(urlToForward)) {
		return notFound();
	}

	const response = await dhis2HttpClient.get(urlToForward);

	return NextResponse.json(response);
}
