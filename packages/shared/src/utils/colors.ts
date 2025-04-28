export function getForeground(backgroundColor: string) {
	// Assuming backgroundColor is in hex format (e.g., #RRGGBB)
	const [r, g, b] = [0, 2, 4].map((i) =>
		parseInt(backgroundColor.substring(i, i + 2), 16),
	);

	// Calculate brightness (YIQ)
	const brightness = r! * 0.299 + g! * 0.587 + b! * 0.114;

	// Set a threshold (you can adjust this)
	const threshold = 128;

	// Choose foreground color
	return brightness > threshold ? "black" : "white";
}
