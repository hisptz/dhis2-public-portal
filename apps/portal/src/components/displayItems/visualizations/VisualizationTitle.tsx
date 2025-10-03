"use client";

export function VisualizationTitle({ title }: { title: string }) {
	return (
		<span className="font-bold flex-1 min-h-[2.5rem] leading-tight line-clamp-2 flex items-start">
			{title}
		</span>
	);
}
