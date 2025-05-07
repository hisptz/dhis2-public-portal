import { Loader } from "@mantine/core";

export function FullPageLoader() {
	return (
		<div className="w-screen h-screen flex items-center justify-center">
			<Loader />
		</div>
	);
}
