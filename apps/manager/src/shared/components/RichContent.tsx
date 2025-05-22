import React from "react";
import JsxParser from "react-jsx-parser";
import DOMPurify from "dompurify";
import truncate from "html-truncate";

interface RichContentProps {
  content: string;
  maxLength?: number; 
}

export function RichContent({ content, maxLength = 200 }: RichContentProps) {
  const sanitizedContent = DOMPurify.sanitize(content, {
    FORBID_TAGS: [],
    FORBID_ATTR: ['ng-version', '_nghost-ng-c*', 'data-sourcepos'],
  });

  const truncatedContent = maxLength
    ? truncate(sanitizedContent, maxLength, { ellipsis: '...' })
    : sanitizedContent;

  return (
    <>
      <JsxParser
        autoCloseVoidElements
        components={{
          SourceFootnote: ({ children, ...props }: { children: React.ReactNode }) => <sup {...props}>{children}</sup>,
          SourcesCarouselInline: () => <span>[Sources]</span>,
        }}
        renderError={({ error }) => <div>{error}</div>}
        onError={(error) => console.error("JsxParser error:", error)}
        jsx={truncatedContent}
      />
    </>
  );
}