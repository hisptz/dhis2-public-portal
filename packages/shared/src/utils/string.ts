export function getTitleCaseFromCamelCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
		.replace(/_/g, " ")
		.trim() // Remove leading and trailing spaces
		.replace(/\s+/g, " ")
		.toLowerCase() // Convert to lowercase
		.replace(/^\w/, (c) => c.toUpperCase());
}
