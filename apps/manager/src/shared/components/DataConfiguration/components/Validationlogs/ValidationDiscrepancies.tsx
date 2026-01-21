import React from 'react';
import {
    CircularLoader,
    NoticeBox,
    Table,
    TableHead,
    TableRowHead,
    TableCellHead,
    TableBody,
    TableRow,
    TableCell,
    Button
} from '@dhis2/ui';
import i18n from '@dhis2/d2-i18n';
import { PeriodUtility, PeriodTypeCategory } from '@hisptz/dhis2-utils';
import { exportDiscrepanciesToExcel } from './exportDiscrepanciesToExcel';
import { ValidationDiscrepancy } from './interfaces/interfaces';


interface DiscrepancySummary {
    total: number;
    critical: number;
    major: number;
    minor: number;
    byType: Record<string, number>;
    byDataElement: Record<string, number>;
}

interface ValidationDiscrepanciesProps {
    discrepancies: ValidationDiscrepancy[];
    summary?: DiscrepancySummary;
    isLoading: boolean;
    error: Error | null;
}

export function ValidationDiscrepancies({ discrepancies, summary, isLoading, error }: ValidationDiscrepanciesProps) {
    const handleDownloadExcel = async () => {
        await exportDiscrepanciesToExcel(discrepancies);
    };

    const formatValue = (value: string | number | null) => {
        if (value === null || value === undefined) {
            return <span className="text-gray-400 italic">{i18n.t('No value')}</span>;
        }
        return String(value);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 border-red-300';
            case 'major':
                return 'bg-yellow-100 border-yellow-300';
            case 'minor':
                return 'bg-yellow-100 border-yellow-300';
            default:
                return '';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-700';
            case 'major':
                return 'text-yellow-700';
            case 'minor':
                return 'text-yellow-700';
            default:
                return '';
        }
    };

    const formatPeriod = (periodId: string): string => {
        try {
            const period = PeriodUtility.getPeriodById(periodId);
            if (period) {
                if (period.type?.type === PeriodTypeCategory.FIXED) {
                    return period.name || periodId;
                }
                return period.name || periodId;
            }
            return periodId;
        } catch (error) {
            return periodId;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <CircularLoader />
            </div>
        );
    }

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Failed to load validation discrepancies')}>
                {error.message || i18n.t('An error occurred while loading the validation discrepancies')}
            </NoticeBox>
        );
    }

    if (discrepancies.length === 0) {
        return (
            <NoticeBox title={i18n.t('No discrepancies found')}>
                {i18n.t('Great! No discrepancies were found between the source and destination data.')}
            </NoticeBox>
        );
    }

    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
                        <span className="text-sm  font-medium">{i18n.t('When destination data is greater than source data')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded"></div>
                        <span className="text-sm  font-medium">{i18n.t('When source data is greater than destination data')}</span>
                    </div>
                </div>
                <Button
                    small
                    onClick={handleDownloadExcel}
                    disabled={discrepancies.length === 0}
                >
                    {i18n.t('Download Excel')}
                </Button>
            </div>
            {(() => {
                const dataElementDataMap = new Map<string, Map<string, { source: any; destination: any; hasDiscrepancy: boolean }>>();
                const periods = new Set<string>();
                const dataElementNames = new Map<string, string>();

                discrepancies.forEach((discrepancy) => {
                    const dataElementCombo = discrepancy.dataElement;

                    periods.add(discrepancy.period);
                    dataElementNames.set(dataElementCombo, discrepancy.dataElementName);

                    if (!dataElementDataMap.has(dataElementCombo)) {
                        dataElementDataMap.set(dataElementCombo, new Map());
                    }

                    const dataElementMap = dataElementDataMap.get(dataElementCombo)!;
                    const hasDiscrepancy = discrepancy.discrepancyType === 'value_mismatch' ||
                        discrepancy.discrepancyType === 'missing_in_destination';

                    dataElementMap.set(discrepancy.period, {
                        source: discrepancy.sourceValue,
                        destination: discrepancy.destinationValue,
                        hasDiscrepancy
                    });
                });

                const dataElementsList = Array.from(dataElementDataMap.keys());
                const periodsList = Array.from(periods).sort();

                return (
                    <div className="w-full overflow-x-auto ">
                        <div style={{ minWidth: `${Math.max(1200, periodsList.length * 200)}px` }}>
                            <Table>
                                <TableHead>
                                    <TableRowHead>
                                        <TableCellHead>{i18n.t('Data Elements')}</TableCellHead>
                                        {periodsList.map((period) => {
                                            return (
                                                <TableCellHead
                                                    key={period}
                                                    colSpan="2"
                                                    className="text-center"
                                                >
                                                    <div className="whitespace-nowrap text-xs min-w-44">
                                                        <div className="font-medium">{formatPeriod(period)}</div>

                                                    </div>
                                                </TableCellHead>
                                            );
                                        })}
                                    </TableRowHead>
                                    <TableRowHead>
                                        <TableCellHead></TableCellHead>
                                        {periodsList.map((period) => (
                                            <React.Fragment key={period}>
                                                <TableCellHead className="text-center text-xs">
                                                    <div className="min-w-20 whitespace-nowrap">{i18n.t('Source')}</div>
                                                </TableCellHead>
                                                <TableCellHead className="text-center text-xs">
                                                    <div className="min-w-20 whitespace-nowrap">{i18n.t('Destination')}</div>
                                                </TableCellHead>
                                            </React.Fragment>
                                        ))}
                                    </TableRowHead>
                                </TableHead>
                                <TableBody>
                                    {dataElementsList.map((dataElementCombo) => {
                                        const dataElementData = dataElementDataMap.get(dataElementCombo)!;
                                        return (
                                            <TableRow key={dataElementCombo}>
                                                <TableCell className="font-medium">
                                                    <div className="whitespace-nowrap max-w-60">
                                                        <div title={dataElementNames.get(dataElementCombo)}>
                                                            {dataElementNames.get(dataElementCombo)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                {periodsList.map((period) => {
                                                    const data = dataElementData.get(period);
                                                    const sourceValue = data?.source ?? null;
                                                    const destinationValue = data?.destination ?? null;
                                                    const hasDiscrepancy = data?.hasDiscrepancy ?? false;

                                                    const discrepancy = discrepancies.find(d =>
                                                        d.dataElement === dataElementCombo &&
                                                        d.period === period
                                                    );
                                                    const severity = discrepancy?.severity || 'minor';

                                                    return (
                                                        <React.Fragment key={period}>
                                                            <TableCell className="text-center">
                                                                <div className="whitespace-nowrap min-w-20 px-2">
                                                                    {formatValue(sourceValue)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell
                                                                className={hasDiscrepancy
                                                                    ? `text-center font-medium border ${getSeverityColor(severity)} ${getSeverityTextColor(severity)}`
                                                                    : "text-center"
                                                                }
                                                            >
                                                                <div className="whitespace-nowrap min-w-20 px-2">
                                                                    {formatValue(destinationValue)}
                                                                </div>
                                                            </TableCell>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}