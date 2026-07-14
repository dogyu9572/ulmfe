package egovframework.let.adm.web;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

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
import egovframework.let.adm.service.EgovMaterialDownloadStatsService;
import egovframework.let.adm.service.vo.MaterialDownloadStatsVO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/material-download-stats")
@RequiredArgsConstructor
public class EgovMaterialDownloadStatsManageApiController {
	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private final EgovMaterialDownloadStatsService materialDownloadStatsService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getStats(
		@RequestParam(required = false) String lrnTypeCd,
		@RequestParam(required = false) String dataTypeCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "all") String searchType,
		@RequestParam(required = false) String keyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success("자료실 다운로드 통계 조회 성공",
			materialDownloadStatsService.getMaterialDownloadStats(
				lrnTypeCd, dataTypeCd, startDate, endDate, searchType, keyword, page, size
			));
	}

	@GetMapping("/excel")
	public ResponseEntity<byte[]> downloadExcel(
		@RequestParam(required = false) String lrnTypeCd,
		@RequestParam(required = false) String dataTypeCd,
		@RequestParam(required = false) String startDate,
		@RequestParam(required = false) String endDate,
		@RequestParam(defaultValue = "all") String searchType,
		@RequestParam(required = false) String keyword
	) throws Exception {
		List<MaterialDownloadStatsVO> rows = materialDownloadStatsService.getMaterialDownloadStatsExcelRows(
			lrnTypeCd, dataTypeCd, startDate, endDate, searchType, keyword
		);
		String filename = "자료실_다운로드_통계_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".xlsx";
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION,
				ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(createWorkbook(rows));
	}

	private byte[] createWorkbook(List<MaterialDownloadStatsVO> rows) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("자료실 다운로드 통계");
			CellStyle headerStyle = workbook.createCellStyle();
			Font font = workbook.createFont();
			font.setBold(true);
			headerStyle.setFont(font);
			String[] columns = {"번호", "학습유형", "프로그램명", "게시글 제목", "첨부파일명", "다운로드 수", "파일등록일"};
			Row header = sheet.createRow(0);
			for (int i = 0; i < columns.length; i++) {
				header.createCell(i).setCellValue(columns[i]);
				header.getCell(i).setCellStyle(headerStyle);
			}
			for (int i = 0; i < rows.size(); i++) {
				MaterialDownloadStatsVO item = rows.get(i);
				Row row = sheet.createRow(i + 1);
				row.createCell(0).setCellValue(rows.size() - i);
				row.createCell(1).setCellValue(text(item.getLrnTypeNm()));
				row.createCell(2).setCellValue(text(item.getProgramNm()));
				row.createCell(3).setCellValue(text(item.getPostTitle()));
				row.createCell(4).setCellValue(text(item.getOriginalFileName()));
				row.createCell(5).setCellValue(item.getDownloadCount() == null ? 0 : item.getDownloadCount());
				row.createCell(6).setCellValue(item.getFileRegDt() == null ? "" : DATE_FORMAT.format(item.getFileRegDt()));
			}
			for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private String text(String value) {
		return value == null ? "" : value;
	}
}
