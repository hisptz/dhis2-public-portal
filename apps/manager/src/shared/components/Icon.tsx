import React from "react";
import styled from "styled-components";

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
