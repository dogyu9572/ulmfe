package egovframework.let.adm.web;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
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
import egovframework.let.adm.service.EgovEducationProgramStatsService;
import egovframework.let.adm.service.vo.EducationProgramStatsVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/education-program-stats")
@RequiredArgsConstructor
public class EgovEducationProgramStatsManageApiController {
	private final EgovEducationProgramStatsService educationProgramStatsService;

	@GetMapping
	public ApiResponse<List<EducationProgramStatsVO>> getStats(
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) {
		return ApiResponse.success("교육프로그램 통계 조회 성공",
			educationProgramStatsService.getEducationProgramStats(startDate, endDate));
	}

	@GetMapping("/excel")
	public ResponseEntity<byte[]> downloadExcel(
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate
	) throws Exception {
		List<EducationProgramStatsVO> stats = educationProgramStatsService.getEducationProgramStats(startDate, endDate);
		String filename = "교육프로그램_통계_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION,
				ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(createWorkbook(stats));
	}

	private byte[] createWorkbook(List<EducationProgramStatsVO> stats) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("교육프로그램 통계");
			CellStyle headerStyle = workbook.createCellStyle();
			Font font = workbook.createFont();
			font.setBold(true);
			headerStyle.setFont(font);
			CellStyle rateStyle = workbook.createCellStyle();
			DataFormat dataFormat = workbook.createDataFormat();
			rateStyle.setDataFormat(dataFormat.getFormat("0.0\"%\""));

			String[] columns = {"프로그램 구분", "프로그램명", "STEP1 완료율", "STEP2 완료율", "STEP3 완료율", "STEP4 완료율"};
			Row header = sheet.createRow(0);
			for (int i = 0; i < columns.length; i++) {
				header.createCell(i).setCellValue(columns[i]);
				header.getCell(i).setCellStyle(headerStyle);
			}

			for (int i = 0; i < stats.size(); i++) {
				EducationProgramStatsVO item = stats.get(i);
				Row row = sheet.createRow(i + 1);
				row.createCell(0).setCellValue(text(item.getProgramTypeNm()));
				row.createCell(1).setCellValue(text(item.getProgramNm()));
				setRate(row, 2, item.getStep1CompletionRate(), rateStyle);
				setRate(row, 3, item.getStep2CompletionRate(), rateStyle);
				setRate(row, 4, item.getStep3CompletionRate(), rateStyle);
				setRate(row, 5, item.getStep4CompletionRate(), rateStyle);
			}
			for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private void setRate(Row row, int column, Double value, CellStyle style) {
		row.createCell(column).setCellValue(value == null ? 0 : value);
		row.getCell(column).setCellStyle(style);
	}

	private String text(String value) {
		return value == null ? "" : value;
	}
}
