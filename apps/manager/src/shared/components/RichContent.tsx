import React from "react";
import DOMPurify from "dompurify";
interface RichContentProps {
  content: string;
  maxLength?: number;
}

export function RichContent({ content, maxLength = 200 }: RichContentProps) {
  const preprocessedContent = content.replace(/<\/?root>/gi, "");

  const sanitizedContent = DOMPurify.sanitize(preprocessedContent, {
    FORBID_TAGS: ["script", "style", "root"],
    FORBID_ATTR: ["ng-version", "_nghost-ng-c*", "data-sourcepos"],
    RETURN_DOM: false,
  });

  const plainText = sanitizedContent.replace(/<[^>]+>/g, "");
  const truncatedText = maxLength
    ? plainText.slice(0, maxLength) + (plainText.length > maxLength ? "..." : "")
    : plainText;

  return <p>{truncatedText}</p>;
}