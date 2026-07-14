package egovframework.let.adm.web;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovNotificationSendLogService;
import egovframework.let.adm.service.vo.NotificationSendLogVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/notification-log")
@RequiredArgsConstructor
public class EgovNotificationSendLogManageApiController {
	private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
	private final EgovNotificationSendLogService notificationSendLogService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getNotificationSendLogs(
		@RequestParam(required = false) String targetCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "all") String searchType,
		@RequestParam(required = false) String keyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"알림 발송 로그 조회 성공",
			notificationSendLogService.getNotificationSendLogs(
				targetCd, startDate, endDate, searchType, keyword, page, size
			)
		);
	}

	@GetMapping("/excel")
	public ResponseEntity<byte[]> downloadExcel(
		@RequestParam(required = false) String targetCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "all") String searchType,
		@RequestParam(required = false) String keyword
	) throws Exception {
		List<NotificationSendLogVO> rows = notificationSendLogService.getNotificationSendLogExcelRows(
			targetCd, startDate, endDate, searchType, keyword
		);
		String filename = "알림_발송_로그_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION,
				ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(createWorkbook(rows));
	}

	private byte[] createWorkbook(List<NotificationSendLogVO> rows) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("알림 발송 로그");
			CellStyle headerStyle = workbook.createCellStyle();
			Font font = workbook.createFont();
			font.setBold(true);
			headerStyle.setFont(font);
			String[] columns = {"번호", "발송일시", "발송 학교", "발송 대상", "내용", "발송 성공"};
			Row header = sheet.createRow(0);
			for (int i = 0; i < columns.length; i++) {
				Cell cell = header.createCell(i);
				cell.setCellValue(columns[i]);
				cell.setCellStyle(headerStyle);
			}
			for (int i = 0; i < rows.size(); i++) {
				NotificationSendLogVO log = rows.get(i);
				Row row = sheet.createRow(i + 1);
				row.createCell(0).setCellValue(rows.size() - i);
				row.createCell(1).setCellValue(log.getSendDt() == null ? "" : DATE_TIME_FORMAT.format(log.getSendDt()));
				row.createCell(2).setCellValue(value(log.getSchlNm()));
				row.createCell(3).setCellValue(value(log.getTargetNm()));
				row.createCell(4).setCellValue(value(log.getContent()));
				row.createCell(5).setCellValue(value(log.getSuccessNm()));
			}
			for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private String value(String value) {
		return value == null ? "" : value;
	}
}
