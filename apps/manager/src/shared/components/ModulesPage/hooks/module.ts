import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModule } from "../providers/ModuleProvider";
import { AppModule, moduleSchema } from "@packages/shared/schemas";

export function useModuleForm() {
	const module = useModule();
	return useForm<AppModule>({
		resolver: zodResolver(moduleSchema),
		defaultValues: {
			...module,
			config: (module?.config as any) ?? {},
		},
	});
}
