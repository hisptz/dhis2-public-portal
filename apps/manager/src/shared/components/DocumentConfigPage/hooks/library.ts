import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLibrary } from "../../LibraryProvider";
import { DocumentItem, documentItemSchema } from "@packages/shared/schemas";

export function useLibraryForm() {
	const library = useLibrary();
	return useForm<DocumentItem>({
		resolver: zodResolver(documentItemSchema),
		defaultValues: library,
	});
}
