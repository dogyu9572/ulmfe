function padDatePart(value: number): string {
	return String(value).padStart(2, '0')
}

export function timestampedExcelFileName(documentType: string, title: string): string {
	const now = new Date()
	const timestamp = [
		now.getFullYear(),
		padDatePart(now.getMonth() + 1),
		padDatePart(now.getDate())
	].join('') + '_' + [
		padDatePart(now.getHours()),
		padDatePart(now.getMinutes()),
		padDatePart(now.getSeconds())
	].join('')
	const safeTitle = (title || '제목없음')
		.replace(/[\\/:*?"<>|]/g, '_')
		.replace(/\s+/g, ' ')
		.trim() || '제목없음'
	return `${documentType}_${safeTitle}_${timestamp}.xlsx`
}
