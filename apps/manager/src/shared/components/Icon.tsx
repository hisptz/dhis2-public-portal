import React from "react";
import DOMPurify from "dompurify";

export interface IconProps {
  icon: string;
  height?: number | string;
  width?: number | string;
}

export function StyledIcon({ icon, height = 24, width = 24 }: IconProps) {
  const Parent = styled.div`
    svg {
      height: ${typeof height === "number" ? `${height}px` : height};
      width: ${typeof width === "number" ? `${width}px` : width};
      color: black;
      aspect-ratio: 1/1;
    }
  `;

	return (
		<Parent
			dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(icon) }}
		/>
	);
}