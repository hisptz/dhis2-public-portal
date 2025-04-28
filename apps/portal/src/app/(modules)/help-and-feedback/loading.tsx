import { Loader } from "@mantine/core";

export default function Loading() {
	return (
		<div className="w-full h-full flex items-center justify-center min-h-[400px]">
			<Loader color="blue" />
		</div>
	);
}
