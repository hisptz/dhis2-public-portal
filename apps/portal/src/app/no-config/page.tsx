import { NoConfigLandingPage } from "@/components/NoConfigLandingPage";
import { Box } from "@mantine/core";

export default async function NoConfigPage() {
	return (
		<Box className="h-screen w-screen">
			<NoConfigLandingPage />
		</Box>
	);
}
