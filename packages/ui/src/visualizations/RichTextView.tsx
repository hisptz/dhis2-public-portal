"use client";

import React from "react";
import JsxParser from "react-jsx-parser";

export function RichTextView({ content }: { content: string }) {
	return <JsxParser jsx={content} />;
}
