import React, { useMemo, RefObject, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { AnalyticsData } from "@packages/shared/schemas";
import { useResizeObserver } from "@mantine/hooks";

type YearOverYearChartVisProps = {
  analytics: AnalyticsData;
  visualizationConfig: any; // Use the correct type if available
  setRef?: RefObject<HighchartsReact.RefObject | null>;
  colors?: string[];
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const YearOverYearChartVis: React.FC<YearOverYearChartVisProps> = ({
  analytics,
  visualizationConfig,
  setRef,
  colors,
}) => {
  const [ref, { height = 0 }] = useResizeObserver();

  const chartType =
    visualizationConfig?.type === "YEAR_OVER_YEAR_LINE"
      ? "line"
      : "column";

  const { categories, series } = useMemo(() => {
    const yearMonthMap: Record<string, Record<string, number | null>> = {};
    const years = new Set<string>();
    const months = new Set<string>();
    (analytics.rows || []).forEach(([year, pe, value]) => {
      const monthIdx = parseInt(pe.slice(4, 6), 10) - 1;
      const month = monthNames[monthIdx];
      years.add(year);
      months.add(month);
      if (!yearMonthMap[year]) yearMonthMap[year] = {};
      yearMonthMap[year][month] = parseFloat(value);
    });
    const allMonths = monthNames.filter(m => months.has(m));
    const allYears = Array.from(years).sort();
    const series = allYears.map(year => ({
      name: year,
      data: allMonths.map(month => yearMonthMap[year]?.[month] ?? null)
    }));
    return { categories: allMonths, series };
  }, [analytics]);

  const options: Highcharts.Options = {
    chart: { type: chartType as any },
    title: { text: "" },
    xAxis: { categories, title: { text: "" } },
    yAxis: { title: { text: "" } },
    series: series as Highcharts.SeriesOptionsType[],
    legend: { enabled: true },
    tooltip: { shared: true },
    credits: { enabled: false },
    colors,
  };

  return (
    <div ref={ref} style={{ width: "100%", height: height || 400, minHeight: 300 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={setRef}
      />
    </div>
  );
};

export default YearOverYearChartVis;