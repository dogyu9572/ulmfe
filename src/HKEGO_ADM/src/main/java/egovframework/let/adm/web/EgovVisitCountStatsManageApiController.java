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
import egovframework.let.adm.service.EgovVisitCountStatsService;
import egovframework.let.adm.service.vo.VisitCountSummaryVO;
import egovframework.let.adm.service.vo.VisitSchoolStatsVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/visitor-stats")
@RequiredArgsConstructor
public class EgovVisitCountStatsManageApiController {
	private final EgovVisitCountStatsService visitCountStatsService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getVisitCountStats(
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) {
		return ApiResponse.success("방문 인원 통계 조회 성공", visitCountStatsService.getVisitCountStats(startDate, endDate));
	}

	@GetMapping("/excel")
	@SuppressWarnings("unchecked")
	public ResponseEntity<byte[]> downloadExcel(
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) throws Exception {
		Map<String, Object> result = visitCountStatsService.getVisitCountStats(startDate, endDate);
		List<VisitCountSummaryVO> summary = (List<VisitCountSummaryVO>) result.get("summary");
		List<VisitSchoolStatsVO> schools = (List<VisitSchoolStatsVO>) result.get("schools");
		String filename = "방문_인원_통계_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION,
				ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(createWorkbook(summary, schools));
	}

	private byte[] createWorkbook(List<VisitCountSummaryVO> summary, List<VisitSchoolStatsVO> schools) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			CellStyle headerStyle = workbook.createCellStyle();
			Font font = workbook.createFont();
			font.setBold(true);
			headerStyle.setFont(font);

			Sheet summarySheet = workbook.createSheet("프로그램별 집계");
			String[] summaryColumns = {"프로그램 구분", "예약 학교 수(명)", "방문 학교 수(명)", "예약 학생 수(명)", "출석완료 학생 수(명)"};
			createHeader(summarySheet, summaryColumns, headerStyle);
			for (int i = 0; i < summary.size(); i++) {
				VisitCountSummaryVO item = summary.get(i);
				Row row = summarySheet.createRow(i + 1);
				row.createCell(0).setCellValue(value(item.getProgramTypeNm()));
				row.createCell(1).setCellValue(number(item.getReservedSchoolCount()));
				row.createCell(2).setCellValue(number(item.getVisitedSchoolCount()));
				row.createCell(3).setCellValue(number(item.getReservedStudentCount()));
				row.createCell(4).setCellValue(number(item.getAttendedStudentCount()));
			}
			autoSize(summarySheet, summaryColumns.length);

			Sheet schoolSheet = workbook.createSheet("학교별 집계");
			String[] schoolColumns = {"순위", "학교명", "학년/반", "방문횟수", "총 방문 학생 수", "출석완료 학생 수", "마지막 방문"};
			createHeader(schoolSheet, schoolColumns, headerStyle);
			for (int i = 0; i < schools.size(); i++) {
				VisitSchoolStatsVO item = schools.get(i);
				Row row = schoolSheet.createRow(i + 1);
				row.createCell(0).setCellValue(i + 1);
				row.createCell(1).setCellValue(value(item.getSchlNm()));
				row.createCell(2).setCellValue(value(item.getGradeClassNm()));
				row.createCell(3).setCellValue(number(item.getVisitCount()));
				row.createCell(4).setCellValue(number(item.getTotalStudentCount()));
				row.createCell(5).setCellValue(number(item.getAttendedStudentCount()));
				row.createCell(6).setCellValue(item.getLastVisitDate() == null ? "" : item.getLastVisitDate().toString());
			}
			autoSize(schoolSheet, schoolColumns.length);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private void createHeader(Sheet sheet, String[] columns, CellStyle style) {
		Row header = sheet.createRow(0);
		for (int i = 0; i < columns.length; i++) {
			Cell cell = header.createCell(i);
			cell.setCellValue(columns[i]);
			cell.setCellStyle(style);
		}
	}

	private void autoSize(Sheet sheet, int columnCount) {
		for (int i = 0; i < columnCount; i++) sheet.autoSizeColumn(i);
	}

	private String value(String value) {
		return value == null ? "" : value;
	}

	private int number(Integer value) {
		return value == null ? 0 : value;
	}
}
