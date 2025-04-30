import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLibrary } from "../../LibraryProvider";
import { librarySchema, LibraryData } from "@packages/shared/schemas";

export function useLibraryForm() {
	const library = useLibrary();
	return useForm<LibraryData>({
		resolver: zodResolver(librarySchema),
		defaultValues: library,
	});
}
