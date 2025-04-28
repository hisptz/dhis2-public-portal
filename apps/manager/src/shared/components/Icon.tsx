import styled from "@emotion/styled";
import React from "react";

export interface IconProps {
	icon: string;
}

export function StyledIcon({ icon }: IconProps) {
	const Parent = styled.div`
		svg {
			height: 24px;
			width: 24px;
			color: black;
			aspect-ratio: 1/1;
		}
	`;

	return <Parent dangerouslySetInnerHTML={{ __html: icon }} />;
}
