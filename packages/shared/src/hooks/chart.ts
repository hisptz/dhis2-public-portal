import { useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";

export function useVisualizationRefs() {
	const chartRef = useRef<HighchartsReact.RefObject>(null);
	const tableRef = useRef<HTMLTableElement>(null);
	const [, setSingleValueRef] = useState<HTMLDivElement | null>(null);

	return {
		chartRef,
		tableRef,
		setSingleValueRef,
	};
}
