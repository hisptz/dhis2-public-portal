import ExcelJS from 'exceljs';
import { PeriodUtility, PeriodTypeCategory } from '@hisptz/dhis2-utils';
import { ValidationDiscrepancy } from './interfaces/interfaces';



const COMPARISON_COLORS = {
    destinationGreater: {
        fill: 'FFFEF2F2',  // Red background
        font: 'FFB91C1C'   // Red text
    },
    sourceGreater: {
        fill: 'FFFEF3C7',  // Yellow background
        font: 'FFDC2626'   // Orange-red text
    }
};

function formatPeriod(periodId: string): string {
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
}

export async function exportDiscrepanciesToExcel(discrepancies: ValidationDiscrepancy[]): Promise<void> {
    if (!discrepancies.length) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DHIS2 Validation';
    workbook.created = new Date();

    const dataSheet = workbook.addWorksheet('Discrepancies', {
        views: [{ state: 'frozen', xSplit: 1, ySplit: 2 }]
    });

    const dataElementDataMap = new Map<string, Map<string, { source: any; destination: any }>>();
    const periods = new Set<string>();
    const dataElementNames = new Map<string, string>();
    const discrepancyMap = new Map<string, ValidationDiscrepancy>();

    discrepancies.forEach((discrepancy) => {
        const dataElementCombo = discrepancy.dataElement;
        periods.add(discrepancy.period);
        dataElementNames.set(dataElementCombo, discrepancy.dataElementName);

        if (!dataElementDataMap.has(dataElementCombo)) {
            dataElementDataMap.set(dataElementCombo, new Map());
        }

        const dataElementMap = dataElementDataMap.get(dataElementCombo)!;
        const key = `${discrepancy.period}-${dataElementCombo}`;

        dataElementMap.set(discrepancy.period, {
            source: discrepancy.sourceValue,
            destination: discrepancy.destinationValue
        });

        discrepancyMap.set(key, discrepancy);
    });

    const dataElementsList = Array.from(dataElementDataMap.keys());
    const periodsList = Array.from(periods).sort();

    // Build header row 1 (Period Names)
    const headerRow1: string[] = ['Data Elements'];
    periodsList.forEach(period => {
        headerRow1.push(formatPeriod(period));
        headerRow1.push('');
    });

    // Build header row 2 (Source/Destination)
    const headerRow2: string[] = [''];
    periodsList.forEach(() => {
        headerRow2.push('Source');
        headerRow2.push('Destination');
    });

    // Add headers
    const row1 = dataSheet.addRow(headerRow1);
    const row2 = dataSheet.addRow(headerRow2);

    row1.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
    });

    row2.eachCell((cell, colNumber) => {
        cell.font = { bold: true, size: 10 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
    });

    for (let i = 0; i < periodsList.length; i++) {
        const startCol = 2 + (i * 2);
        const endCol = startCol + 1;
        dataSheet.mergeCells(1, startCol, 1, endCol);
    }

    dataElementsList.forEach((dataElementCombo, deIndex) => {
        const dataElementMap = dataElementDataMap.get(dataElementCombo)!;
        const rowData: (string | number | null)[] = [dataElementNames.get(dataElementCombo) || dataElementCombo];

        periodsList.forEach(period => {
            const data = dataElementMap.get(period);
            rowData.push(data?.source ?? '');
            rowData.push(data?.destination ?? '');
        });

        const dataRow = dataSheet.addRow(rowData);
        const rowNumber = deIndex + 3;

        const dataElementCell = dataRow.getCell(1);
        dataElementCell.font = { bold: true };
        dataElementCell.alignment = { wrapText: true, vertical: 'middle' };
        dataElementCell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };

        periodsList.forEach((period, periodIndex) => {
            const sourceColNum = 2 + (periodIndex * 2);
            const destColNum = sourceColNum + 1;

            const sourceCell = dataRow.getCell(sourceColNum);
            const destCell = dataRow.getCell(destColNum);

            [sourceCell, destCell].forEach(cell => {
                cell.alignment = { horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });

            const key = `${period}-${dataElementCombo}`;
            const discrepancy = discrepancyMap.get(key);

            if (discrepancy && (discrepancy.discrepancyType === 'value_mismatch' || discrepancy.discrepancyType === 'missing_in_destination')) {
                const sourceValue = parseFloat(String(discrepancy.sourceValue ?? '0')) || 0;
                const destValue = parseFloat(String(discrepancy.destinationValue ?? '0')) || 0;
                
                const colors = destValue > sourceValue 
                    ? COMPARISON_COLORS.destinationGreater 
                    : COMPARISON_COLORS.sourceGreater;
                
                destCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: colors.fill }
                };
                destCell.font = {
                    bold: true,
                    color: { argb: colors.font }
                };
            }
        });
    });

    dataSheet.getColumn(1).width = 45;
    for (let i = 2; i <= 1 + periodsList.length * 2; i++) {
        dataSheet.getColumn(i).width = 15;
    }

    const legendSheet = workbook.addWorksheet('Legend');
    legendSheet.addRow(['Color', 'Description', 'Sample']);

    const legendHeader = legendSheet.getRow(1);
    legendHeader.eachCell(cell => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' }
        };
    });

    // Add legend entries
    const redRow = legendSheet.addRow(['Red', 'When destination data is greater than source data', '']);
    redRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COMPARISON_COLORS.destinationGreater.fill }
    };
    redRow.getCell(3).font = { bold: true, color: { argb: COMPARISON_COLORS.destinationGreater.font } };
    redRow.getCell(3).value = 'Sample';

    const yellowRow = legendSheet.addRow(['Yellow', 'When source data is greater than destination data', '']);
    yellowRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COMPARISON_COLORS.sourceGreater.fill }
    };
    yellowRow.getCell(3).font = { bold: true, color: { argb: COMPARISON_COLORS.sourceGreater.font } };
    yellowRow.getCell(3).value = 'Sample';

    legendSheet.getColumn(1).width = 15;
    legendSheet.getColumn(2).width = 40;
    legendSheet.getColumn(3).width = 15;

    // Generate file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-discrepancies.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
