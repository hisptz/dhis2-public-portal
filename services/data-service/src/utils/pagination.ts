export function getPagination(page?: string, pageSize?: string) {
	const pageNumber = parseInt(page ?? '1');
	const pageSizeNumber = parseInt(pageSize ?? '10');

	return {
		skip: (pageNumber - 1) * pageSizeNumber,
		take: pageSizeNumber,
		pageNumber,
		pageSizeNumber
	};
}
