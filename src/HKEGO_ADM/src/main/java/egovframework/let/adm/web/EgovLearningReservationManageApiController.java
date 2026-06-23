package egovframework.let.adm.web;

import egovframework.com.cmm.ApiResponse;
import egovframework.let.adm.service.EgovLearningReservationService;
import egovframework.let.adm.service.vo.LearningReservationDto;
import egovframework.let.adm.service.vo.LearningReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/learning-reservations")
@RequiredArgsConstructor
public class EgovLearningReservationManageApiController {
	private final EgovLearningReservationService learningReservationService;
	private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	@GetMapping
	public ApiResponse<Map<String, Object>> getLearningReservations(
		@RequestParam(required = false) String lrnSttsCd,
		@RequestParam(required = false) String prgrmTypeCd,
		@RequestParam(required = false) String startRsvtYmd,
		@RequestParam(required = false) String endRsvtYmd,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword,
		@RequestParam(defaultValue = "1") int page,
		@RequestParam(defaultValue = "20") int size
	) {
		return ApiResponse.success(
			"예약 목록 조회 성공",
			learningReservationService.getLearningReservationListPage(lrnSttsCd, prgrmTypeCd, startRsvtYmd, endRsvtYmd, searchType, searchKeyword, page, size)
		);
	}

	@GetMapping("/{rsvtSn}")
	public ApiResponse<LearningReservationVO> getLearningReservation(@PathVariable Integer rsvtSn) {
		return ApiResponse.success("예약 상세 조회 성공", learningReservationService.getLearningReservationById(rsvtSn));
	}

	@GetMapping("/excel")
	public ResponseEntity<byte[]> downloadLearningReservationExcel(
		@RequestParam(required = false) String lrnSttsCd,
		@RequestParam(required = false) String prgrmTypeCd,
		@RequestParam(required = false) String startRsvtYmd,
		@RequestParam(required = false) String endRsvtYmd,
		@RequestParam(required = false) String searchType,
		@RequestParam(required = false) String searchKeyword
	) throws Exception {
		List<LearningReservationVO> rows = learningReservationService.getLearningReservationExcelRows(
			lrnSttsCd, prgrmTypeCd, startRsvtYmd, endRsvtYmd, searchType, searchKeyword
		);
		return excelResponse("learning-reservations.xlsx", createReservationWorkbook(rows));
	}

	@GetMapping("/students/template")
	public ResponseEntity<byte[]> downloadStudentTemplate() throws Exception {
		return excelResponse("learning-reservation-students-template.xlsx", createStudentTemplateWorkbook());
	}

	@GetMapping("/import-template")
	public ResponseEntity<byte[]> downloadReservationImportTemplate() throws Exception {
		return excelResponse("learning-reservation-import-template.xlsx", createReservationImportTemplateWorkbook());
	}

	@PostMapping
	public ApiResponse<LearningReservationVO> createLearningReservation(@RequestBody LearningReservationDto dto) {
		return ApiResponse.success("예약 등록 성공", learningReservationService.createLearningReservation(dto));
	}

	@PutMapping("/{rsvtSn}")
	public ApiResponse<LearningReservationVO> updateLearningReservation(@PathVariable Integer rsvtSn, @RequestBody LearningReservationDto dto) {
		return ApiResponse.success("예약 수정 성공", learningReservationService.updateLearningReservation(rsvtSn, dto));
	}

	@PostMapping("/{rsvtSn}/students/import")
	public ApiResponse<LearningReservationVO> importStudents(@PathVariable Integer rsvtSn, @RequestParam("file") MultipartFile file) throws Exception {
		try {
			return ApiResponse.success("학생명단 일괄등록 성공", learningReservationService.importStudents(rsvtSn, file));
		} catch (Exception e) {
			return ApiResponse.error(e.getMessage());
		}
	}

	@PostMapping("/import")
	public ApiResponse<Integer> importReservations(@RequestParam("file") MultipartFile file) throws Exception {
		try {
			return ApiResponse.success("예약 일괄등록 성공", learningReservationService.importReservations(file));
		} catch (Exception e) {
			return ApiResponse.error(e.getMessage());
		}
	}

	@DeleteMapping("/{rsvtSn}")
	public ApiResponse<Void> deleteLearningReservation(@PathVariable Integer rsvtSn) {
		learningReservationService.deleteLearningReservation(rsvtSn);
		return ApiResponse.success("예약 삭제 성공", null);
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

	private byte[] createReservationWorkbook(List<LearningReservationVO> rows) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("예약 목록");
			CellStyle headerStyle = headerStyle(workbook);
			String[] columns = {"번호", "예약번호", "학교명", "학년", "인솔자", "연락처", "예약일", "방문 예정 시간", "구분", "프로그램명", "예약 인원", "실제 인원", "학생명단", "학습 진행상태", "등록일"};
			writeHeader(sheet, headerStyle, columns);
			int rowIndex = 1;
			for (LearningReservationVO reservation : rows) {
				Row row = sheet.createRow(rowIndex++);
				row.createCell(0).setCellValue(reservation.getRsvtSn() == null ? 0 : reservation.getRsvtSn());
				row.createCell(1).setCellValue(nvl(reservation.getRsvtNo()));
				row.createCell(2).setCellValue(nvl(reservation.getSchlNm()));
				row.createCell(3).setCellValue(nvl(reservation.getScyrNm()));
				row.createCell(4).setCellValue(nvl(reservation.getPicNm()));
				row.createCell(5).setCellValue(nvl(reservation.getPicTelno()));
				row.createCell(6).setCellValue(reservation.getRsvtYmd() == null ? "" : reservation.getRsvtYmd().toString());
				row.createCell(7).setCellValue(nvl(reservation.getVstHm()));
				row.createCell(8).setCellValue(nvl(reservation.getPrgrmTypeNm()));
				row.createCell(9).setCellValue(nvl(reservation.getPrgrmNm()));
				row.createCell(10).setCellValue(reservation.getRsvtNope() == null ? 0 : reservation.getRsvtNope());
				row.createCell(11).setCellValue(reservation.getActlNope() == null ? 0 : reservation.getActlNope());
				row.createCell(12).setCellValue("Y".equals(reservation.getStdntListYn()) ? "등록" : "미등록");
				row.createCell(13).setCellValue(nvl(reservation.getLrnSttsNm()));
				row.createCell(14).setCellValue(reservation.getRegDt() == null ? "" : DATE_TIME_FORMAT.format(reservation.getRegDt()));
			}
			autoSize(sheet, columns.length);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private byte[] createReservationImportTemplateWorkbook() throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("예약 일괄등록");
			CellStyle headerStyle = headerStyle(workbook);
			String[] columns = {"번호", "예약번호", "학교명", "학년", "인솔자", "연락처", "예약일", "방문 예정 시간", "구분", "프로그램명", "예약 인원"};
			writeHeader(sheet, headerStyle, columns);
			Row sample = sheet.createRow(1);
			String[] sampleValues = {
				"1", "", "울산초등학교", "5", "홍길동", "010-1234-5678",
				"2026-06-22", "10:00", "미션", "미션 테스트", "24"
			};
			for (int i = 0; i < sampleValues.length; i++) {
				sample.createCell(i).setCellValue(sampleValues[i]);
			}
			autoSize(sheet, columns.length);
			workbook.write(out);
			return out.toByteArray();
		}
	}

	private byte[] createStudentTemplateWorkbook() throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			Sheet sheet = workbook.createSheet("학생명단");
			CellStyle headerStyle = headerStyle(workbook);
			String[] columns = {"번호", "반", "반번호", "이름", "팀", "배정(미션/코스)", "동선"};
			writeHeader(sheet, headerStyle, columns);
			String[][] examples = {
				{"1", "2반", "1", "홍길동", "A", "소비습관 구축작전", "지구존 -> 미래존 -> 사회존 -> 도서관"},
				{"21", "3반", "2", "김영희", "B", "이상한 날씨 해결작전", "미래존 -> 사회존 -> 옥상"},
				{"41", "4반", "3", "박민수", "C", "미래를 위한 오늘의 실천작전", "사회존 -> 로비 -> 지구존 -> 미래존"}
			};
			for (int i = 0; i < examples.length; i++) {
				Row row = sheet.createRow(i + 1);
				for (int j = 0; j < examples[i].length; j++) {
					row.createCell(j).setCellValue(examples[i][j]);
				}
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
}
