export function getForeground(backgroundColor: string) {
	if (backgroundColor.startsWith("#")) {
		backgroundColor = backgroundColor.slice(1);
	}

	const [r, g, b] = [0, 2, 4].map((i) =>
		parseInt(backgroundColor.substring(i, i + 2), 16),
	);

	const brightness = r! * 0.299 + g! * 0.587 + b! * 0.114;
	const threshold = 128;

	return brightness > threshold ? "black" : "white";
}
