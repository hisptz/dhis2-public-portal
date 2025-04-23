"use client";

import { NotFoundError } from "@/components/ErrorPages/NotFoundPage";

export interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	return NotFoundError();
}
