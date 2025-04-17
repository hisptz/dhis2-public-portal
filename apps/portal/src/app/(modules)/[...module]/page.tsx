export default async function ModuleLandingPage({
	params,
}: {
	params: Promise<{ module: string[] }>;
}) {
	const { module } = await params;
	return <div>The landing page</div>;
}
