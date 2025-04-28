import { utils as xlsx, writeFile } from "xlsx";

export function downloadExcelFromTable(
	tableRef: HTMLTableElement,
	title: string,
) {
	const sheet = xlsx.table_to_sheet(tableRef);
	const workbook = xlsx.book_new();
	xlsx.book_append_sheet(workbook, sheet, `${title.substring(0, 31)}`); //TODO: Notify user if title is too long
	writeFile(workbook, `${title}.${"xlsx"}`);
}
