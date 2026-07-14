package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovUserAccessLogService;
import egovframework.let.adm.service.vo.UserAccessLogVO;
import lombok.RequiredArgsConstructor;
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

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/user-access-log")
@RequiredArgsConstructor
public class EgovUserAccessLogManageApiController {
	private final EgovUserAccessLogService userAccessLogService;
	private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	@GetMapping
	public ApiResponse<Map<String, Object>> getUserAccessLogs(
		@RequestParam(required = false) String userId,
		@RequestParam(required = false) String userNm,
		@RequestParam(required = false) String ipAddr,
		@RequestParam(required = false) String cntnTypeCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"사용자접속로그 조회 성공",
			userAccessLogService.getUserAccessLogs(userId, userNm, ipAddr, cntnTypeCd, startDate, endDate, page, size)
		);
	}

	@GetMapping("/excel")
	public ResponseEntity<byte[]> downloadUserAccessLogExcel(
		@RequestParam(required = false) String userId,
		@RequestParam(required = false) String userNm,
		@RequestParam(required = false) String ipAddr,
		@RequestParam(required = false) String cntnTypeCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) throws Exception {
		List<UserAccessLogVO> rows = userAccessLogService.getUserAccessLogExcelRows(
			userId, userNm, ipAddr, cntnTypeCd, startDate, endDate
		);
		byte[] body = createWorkbook(rows);
		String filename = "사용자_접속로그_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";
		ContentDisposition disposition = ContentDisposition.attachment()
			.filename(filename, StandardCharsets.UTF_8)
			.build();
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(body);
	}

	private byte[] createWorkbook(List<UserAccessLogVO> rows) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("사용자 접속로그");
			CellStyle headerStyle = workbook.createCellStyle();
			Font headerFont = workbook.createFont();
			headerFont.setBold(true);
			headerStyle.setFont(headerFont);

			Row header = sheet.createRow(0);
			String[] columns = {"번호", "접속일시", "접속 IP", "접속 페이지 URL"};
			for (int i = 0; i < columns.length; i++) {
				Cell cell = header.createCell(i);
				cell.setCellValue(columns[i]);
				cell.setCellStyle(headerStyle);
			}

			int rowIndex = 1;
			for (UserAccessLogVO log : rows) {
				Row row = sheet.createRow(rowIndex++);
				row.createCell(0).setCellValue(rows.size() - rowIndex + 2);
				row.createCell(1).setCellValue(log.getRegDt() == null ? "" : DATE_TIME_FORMAT.format(log.getRegDt()));
				row.createCell(2).setCellValue(nvl(log.getIpAddr()));
				row.createCell(3).setCellValue(nvl(log.getRequestUri()));
			}
			for (int i = 0; i < columns.length; i++) {
				sheet.autoSizeColumn(i);
			}
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private String nvl(String value) {
		return value == null ? "" : value;
	}
}
