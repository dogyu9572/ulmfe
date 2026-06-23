package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLearningResultService;
import egovframework.let.adm.service.vo.LearningResultAnswerVO;
import egovframework.let.adm.service.vo.LearningResultStudentVO;
import egovframework.let.adm.service.vo.LearningResultVO;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/learning-results")
@RequiredArgsConstructor
public class EgovLearningResultManageApiController {
	private final EgovLearningResultService learningResultService;

	@GetMapping
	public ApiResponse<Map<String, Object>> getLearningResults(
		@RequestParam(required = false) String prgrmTypeCd,
		@RequestParam(required = false) String startLrnYmd,
		@RequestParam(required = false) String endLrnYmd,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"학습결과 목록 조회 성공",
			learningResultService.getLearningResultListPage(prgrmTypeCd, startLrnYmd, endLrnYmd, searchType, searchKeyword, page, size)
		);
	}

	@GetMapping("/{rsvtSn}")
	public ApiResponse<LearningResultVO> getLearningResult(@PathVariable Integer rsvtSn) {
		return ApiResponse.success("학습결과 상세 조회 성공", learningResultService.getLearningResultDetail(rsvtSn));
	}

	@GetMapping("/{rsvtSn}/students/{stdntSn}/answers")
	public ApiResponse<List<LearningResultAnswerVO>> getStudentAnswers(
		@PathVariable Integer rsvtSn,
		@PathVariable Integer stdntSn,
		@RequestParam(required = false) String ansTypeCd
	) {
		return ApiResponse.success("학생 학습결과 조회 성공", learningResultService.getStudentAnswers(rsvtSn, stdntSn, ansTypeCd));
	}

	@GetMapping("/{rsvtSn}/answers")
	public ApiResponse<List<LearningResultAnswerVO>> getReservationAnswers(
		@PathVariable Integer rsvtSn,
		@RequestParam(required = false) String ansTypeCd
	) {
		return ApiResponse.success("예약 학습결과 조회 성공", learningResultService.getStudentAnswers(rsvtSn, null, ansTypeCd));
	}

	@GetMapping("/{rsvtSn}/excel")
	public ResponseEntity<byte[]> downloadLearningResultDetailExcel(@PathVariable Integer rsvtSn) throws Exception {
		LearningResultVO detail = learningResultService.getLearningResultDetail(rsvtSn);
		return excelResponse("learning-result-detail.xlsx", createLearningResultDetailWorkbook(detail));
	}

	private ResponseEntity<byte[]> excelResponse(String fileName, byte[] body) {
		ContentDisposition disposition = ContentDisposition.attachment()
			.filename(fileName, StandardCharsets.UTF_8)
			.build();
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
			.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
			.body(body);
	}

	private byte[] createLearningResultDetailWorkbook(LearningResultVO detail) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("학생별 결과");
			CellStyle headerStyle = headerStyle(workbook);
			String[] columns = {"번호", "반", "반번호", "이름", "팀", "미션", "완료", "출석"};
			writeHeader(sheet, headerStyle, columns);
			int rowIndex = 1;
			for (LearningResultStudentVO student : detail.getStudents() == null ? List.<LearningResultStudentVO>of() : detail.getStudents()) {
				Row row = sheet.createRow(rowIndex++);
				row.createCell(0).setCellValue(nvl(student.getStdntNo()));
				row.createCell(1).setCellValue(nvl(student.getClasNm()));
				row.createCell(2).setCellValue(nvl(student.getClasNo()));
				row.createCell(3).setCellValue(nvl(student.getStdntNm()));
				row.createCell(4).setCellValue(nvl(student.getTeamNm()));
				row.createCell(5).setCellValue(nvl(student.getAsgnNm()));
				row.createCell(6).setCellValue(nvl(student.getDoneStepCnt()) + "/" + nvl(student.getTotalStepCnt()));
				row.createCell(7).setCellValue("Y".equals(student.getAtndYn()) ? "출석" : "미출석");
			}
			autoSize(sheet, columns.length);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private CellStyle headerStyle(Workbook workbook) {
		CellStyle headerStyle = workbook.createCellStyle();
		Font headerFont = workbook.createFont();
		headerFont.setBold(true);
		headerStyle.setFont(headerFont);
		return headerStyle;
	}

	private void writeHeader(Sheet sheet, CellStyle headerStyle, String[] columns) {
		Row header = sheet.createRow(0);
		for (int i = 0; i < columns.length; i++) {
			Cell cell = header.createCell(i);
			cell.setCellValue(columns[i]);
			cell.setCellStyle(headerStyle);
		}
	}

	private void autoSize(Sheet sheet, int length) {
		for (int i = 0; i < length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	private String nvl(String value) {
		return value == null ? "" : value;
	}

	private int nvl(Integer value) {
		return value == null ? 0 : value;
	}
}
