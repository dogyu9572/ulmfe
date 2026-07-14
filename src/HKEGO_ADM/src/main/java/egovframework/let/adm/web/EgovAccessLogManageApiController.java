package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovAccessLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

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

import egovframework.let.adm.service.vo.AdminAccessLogVO;

@RestController
@RequestMapping("/api/admin/access-log")
@RequiredArgsConstructor
public class EgovAccessLogManageApiController {
	private final EgovAccessLogService accessLogService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getAccessLogs(
		@RequestParam(required = false) String menu1Cd,
		@RequestParam(required = false) String menu2Cd,
		@RequestParam(required = false) String userNm,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"관리자접속로그 조회 성공",
			accessLogService.getAccessLogs(menu1Cd, menu2Cd, userNm, startDate, endDate, page, size)
		);
	}

	@GetMapping("/excel")
	public ResponseEntity<byte[]> excel(
		@RequestParam(required = false) String menu1Cd,
		@RequestParam(required = false) String menu2Cd,
		@RequestParam(required = false) String userNm,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) throws Exception {
		List<AdminAccessLogVO> rows = accessLogService.getAccessLogExcelRows(menu1Cd, menu2Cd, userNm, startDate, endDate);
		byte[] body = createWorkbook(rows);
		String filename = "관리자_접속로그_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(body);
	}

	private byte[] createWorkbook(List<AdminAccessLogVO> rows) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("관리자 접속로그");
			CellStyle headerStyle = workbook.createCellStyle();
			Font font = workbook.createFont();
			font.setBold(true);
			headerStyle.setFont(font);
			String[] columns = {"번호", "1depth", "2depth", "버튼 액션", "내용", "접속 IP", "관리자", "등록일시"};
			Row header = sheet.createRow(0);
			for (int i = 0; i < columns.length; i++) {
				Cell cell = header.createCell(i);
				cell.setCellValue(columns[i]);
				cell.setCellStyle(headerStyle);
			}
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
			for (int i = 0; i < rows.size(); i++) {
				AdminAccessLogVO log = rows.get(i);
				Row row = sheet.createRow(i + 1);
				row.createCell(0).setCellValue(rows.size() - i);
				row.createCell(1).setCellValue(value(log.getMenu1Nm()));
				row.createCell(2).setCellValue(value(log.getMenu2Nm()));
				row.createCell(3).setCellValue(value(log.getActionNm()));
				row.createCell(4).setCellValue(value(log.getActionCn()));
				row.createCell(5).setCellValue(value(log.getIpAddr()));
				row.createCell(6).setCellValue(value(log.getUserNm()));
				row.createCell(7).setCellValue(log.getRegDt() == null ? "" : formatter.format(log.getRegDt()));
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
