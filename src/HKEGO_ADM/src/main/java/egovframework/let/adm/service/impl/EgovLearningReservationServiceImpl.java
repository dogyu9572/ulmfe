package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovLearningReservationService;
import egovframework.let.adm.service.vo.LearningReservationDto;
import egovframework.let.adm.service.vo.LearningReservationStudentDto;
import egovframework.let.adm.service.vo.LearningReservationStudentVO;
import egovframework.let.adm.service.vo.LearningReservationVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service("egovLearningReservationService")
public class EgovLearningReservationServiceImpl extends EgovAbstractServiceImpl implements EgovLearningReservationService {
	private static final DateTimeFormatter RSVT_NO_DATE = DateTimeFormatter.ofPattern("yyMMdd");

	@Resource(name = "learningReservationDAO")
	private LearningReservationDAO learningReservationDAO;

	public Map<String, Object> getLearningReservationListPage(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = learningReservationDAO.countLearningReservationList(
			normalize(lrnSttsCd), normalize(prgrmTypeCd), normalize(startRsvtYmd), normalize(endRsvtYmd), normalize(searchType), normalize(searchKeyword)
		);
		List<LearningReservationVO> list = learningReservationDAO.selectLearningReservationList(
			normalize(lrnSttsCd), normalize(prgrmTypeCd), normalize(startRsvtYmd), normalize(endRsvtYmd), normalize(searchType), normalize(searchKeyword),
			offset, safeSize
		);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public List<LearningReservationVO> getLearningReservationExcelRows(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword
	) {
		return learningReservationDAO.selectLearningReservationList(
			normalize(lrnSttsCd), normalize(prgrmTypeCd), normalize(startRsvtYmd), normalize(endRsvtYmd), normalize(searchType), normalize(searchKeyword),
			0, 10000
		);
	}

	public LearningReservationVO getLearningReservationById(Integer rsvtSn) {
		LearningReservationVO reservation = learningReservationDAO.findById(rsvtSn);
		if (reservation == null) {
			throw new IllegalArgumentException("예약 정보를 찾을 수 없습니다.");
		}
		reservation.setStudents(learningReservationDAO.selectStudents(rsvtSn));
		return reservation;
	}

	@Transactional
	public LearningReservationVO createLearningReservation(LearningReservationDto dto) {
		LearningReservationVO reservation = toReservation(null, dto, "admin");
		if (reservation.getRsvtNo() == null) {
			reservation.setRsvtNo(generateReservationNo(reservation.getRsvtYmd()));
		}
		learningReservationDAO.insert(reservation);
		saveStudents(reservation.getRsvtSn(), dto.getStudents(), "admin");
		return getLearningReservationById(reservation.getRsvtSn());
	}

	@Transactional
	public LearningReservationVO updateLearningReservation(Integer rsvtSn, LearningReservationDto dto) {
		if (learningReservationDAO.findById(rsvtSn) == null) {
			throw new IllegalArgumentException("예약 정보를 찾을 수 없습니다.");
		}
		LearningReservationVO reservation = toReservation(rsvtSn, dto, "admin");
		learningReservationDAO.update(reservation);
		saveStudents(rsvtSn, dto.getStudents(), "admin");
		return getLearningReservationById(rsvtSn);
	}

	@Transactional
	public int importReservations(MultipartFile file) throws IOException {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("업로드할 예약 엑셀 파일을 선택하세요.");
		}
		List<LearningReservationDto> reservations = readReservations(file);
		if (reservations.isEmpty()) {
			throw new IllegalArgumentException("등록할 예약 데이터가 없습니다.");
		}
		int savedCount = 0;
		for (int i = 0; i < reservations.size(); i++) {
			try {
				createLearningReservation(reservations.get(i));
			} catch (IllegalArgumentException e) {
				throw new IllegalArgumentException((i + 2) + "행: " + e.getMessage());
			}
			savedCount++;
		}
		return savedCount;
	}

	@Transactional
	public LearningReservationVO importStudents(Integer rsvtSn, MultipartFile file) throws IOException {
		if (learningReservationDAO.findById(rsvtSn) == null) {
			throw new IllegalArgumentException("예약 정보를 찾을 수 없습니다.");
		}
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("업로드할 학생명단 파일을 선택하세요.");
		}
		List<LearningReservationStudentDto> students = readStudents(file);
		if (students.isEmpty()) {
			throw new IllegalArgumentException("등록할 학생명단이 없습니다.");
		}
		saveStudents(rsvtSn, students, "admin");
		return getLearningReservationById(rsvtSn);
	}

	@Transactional
	public void deleteLearningReservation(Integer rsvtSn) {
		if (learningReservationDAO.findById(rsvtSn) == null) {
			throw new IllegalArgumentException("예약 정보를 찾을 수 없습니다.");
		}
		learningReservationDAO.deleteStudents(rsvtSn);
		learningReservationDAO.delete(rsvtSn);
	}

	private LearningReservationVO toReservation(Integer rsvtSn, LearningReservationDto dto, String adminId) {
		String prgrmTypeCd = normalizeRequired(dto.getPrgrmTypeCd(), "프로그램 구분");
		if (!List.of("MISSION", "EXPLORE").contains(prgrmTypeCd)) {
			throw new IllegalArgumentException("프로그램 구분을 올바르게 선택하세요.");
		}
		return LearningReservationVO.builder()
			.rsvtSn(rsvtSn)
			.rsvtNo(normalize(dto.getRsvtNo()))
			.schlNm(normalizeRequired(dto.getSchlNm(), "학교명"))
			.scyrNm(normalizeNumberRequired(dto.getScyrNm(), "학년"))
			.picNm(normalizeRequired(dto.getPicNm(), "인솔자 이름"))
			.picTelno(normalizeRequired(dto.getPicTelno(), "인솔자 연락처"))
			.picEmlAddr(normalize(dto.getPicEmlAddr()))
			.rsvtYmd(LocalDate.parse(normalizeRequired(dto.getRsvtYmd(), "예약 날짜")))
			.vstHm(normalizeRequired(dto.getVstHm(), "방문 예정 시간"))
			.rsvtNope(nonNegative(dto.getRsvtNope(), "예약 인원"))
			.actlNope(nonNegative(dto.getActlNope(), "실제 인원"))
			.prgrmTypeCd(prgrmTypeCd)
			.prgrmSn(requiredPositive(dto.getPrgrmSn(), "프로그램"))
			.lrnSttsCd(lrnStatus(dto.getLrnSttsCd()))
			.stdntListYn((dto.getStudents() == null || dto.getStudents().isEmpty()) ? "N" : "Y")
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private void saveStudents(Integer rsvtSn, List<LearningReservationStudentDto> students, String adminId) {
		Map<Integer, LearningReservationStudentVO> existingStudents = learningReservationDAO.selectStudents(rsvtSn)
			.stream()
			.collect(java.util.stream.Collectors.toMap(LearningReservationStudentVO::getStdntSn, student -> student));
		List<Integer> retainedStudentSns = new ArrayList<>();
		if (students != null) {
			for (int i = 0; i < students.size(); i++) {
				LearningReservationStudentDto dto = students.get(i);
				if (isEmptyStudent(dto)) {
					continue;
				}
				LearningReservationStudentVO student = toStudent(rsvtSn, i + 1, dto, adminId);
				if (student.getStdntSn() != null && existingStudents.containsKey(student.getStdntSn())) {
					learningReservationDAO.updateStudent(student);
					retainedStudentSns.add(student.getStdntSn());
				} else {
					learningReservationDAO.insertStudent(student);
					retainedStudentSns.add(student.getStdntSn());
				}
			}
		}
		if (retainedStudentSns.isEmpty()) {
			learningReservationDAO.deleteStudents(rsvtSn);
		} else {
			learningReservationDAO.deleteStudentsExcept(rsvtSn, retainedStudentSns);
		}
		learningReservationDAO.updateActualStudentCount(rsvtSn);
	}

	private List<LearningReservationDto> readReservations(MultipartFile file) throws IOException {
		try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
			Sheet sheet = workbook.getNumberOfSheets() == 0 ? null : workbook.getSheetAt(0);
			if (sheet == null) {
				return List.of();
			}
			DataFormatter formatter = new DataFormatter();
			List<LearningReservationDto> reservations = new ArrayList<>();
			for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
				Row row = sheet.getRow(rowIndex);
				if (row == null) {
					continue;
				}
				String rsvtNo = cellValue(row, 1, formatter);
				String schlNm = cellValue(row, 2, formatter);
				String scyrNm = cellValue(row, 3, formatter);
				String picNm = cellValue(row, 4, formatter);
				String picTelno = cellValue(row, 5, formatter);
				String rsvtYmd = cellValue(row, 6, formatter);
				String vstHm = cellValue(row, 7, formatter);
				String prgrmType = cellValue(row, 8, formatter);
				String prgrmNm = cellValue(row, 9, formatter);
				String rsvtNope = cellValue(row, 10, formatter);
				if (Arrays.asList(rsvtNo, schlNm, scyrNm, picNm, picTelno, rsvtYmd, vstHm, prgrmType, prgrmNm, rsvtNope)
					.stream().allMatch(value -> normalize(value) == null)) {
					continue;
				}
				try {
					LearningReservationDto dto = new LearningReservationDto();
					dto.setRsvtNo(rsvtNo);
					dto.setSchlNm(schlNm);
					dto.setScyrNm(scyrNm);
					dto.setPicNm(picNm);
					dto.setPicTelno(picTelno);
					dto.setRsvtYmd(rsvtYmd);
					dto.setVstHm(vstHm);
					dto.setPrgrmTypeCd(programType(prgrmType));
					dto.setPrgrmSn(programSn(dto.getPrgrmTypeCd(), prgrmNm));
					dto.setRsvtNope(parseInt(rsvtNope));
					dto.setActlNope(0);
					dto.setLrnSttsCd("READY");
					reservations.add(dto);
				} catch (IllegalArgumentException e) {
					throw new IllegalArgumentException((rowIndex + 1) + "행: " + e.getMessage());
				}
			}
			return reservations;
		} catch (IOException e) {
			throw e;
		} catch (IllegalArgumentException e) {
			throw e;
		} catch (Exception e) {
			throw new IllegalArgumentException("예약 엑셀 파일을 읽을 수 없습니다.");
		}
	}

	private List<LearningReservationStudentDto> readStudents(MultipartFile file) throws IOException {
		try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
			Sheet sheet = workbook.getNumberOfSheets() == 0 ? null : workbook.getSheetAt(0);
			if (sheet == null) {
				return List.of();
			}
			DataFormatter formatter = new DataFormatter();
			List<LearningReservationStudentDto> students = new ArrayList<>();
			for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
				Row row = sheet.getRow(rowIndex);
				if (row == null) {
					continue;
				}
				LearningReservationStudentDto dto = new LearningReservationStudentDto();
				dto.setStdntNo(cellValue(row, 0, formatter));
				dto.setClasNm(cellValue(row, 1, formatter));
				dto.setClasNo(cellValue(row, 2, formatter));
				dto.setStdntNm(cellValue(row, 3, formatter));
				dto.setTeamNm(cellValue(row, 4, formatter));
				dto.setAsgnNm(cellValue(row, 5, formatter));
				dto.setRouteCn(cellValue(row, 6, formatter));
				dto.setAtndYn("N");
				dto.setLrnSttsCd("READY");
				dto.setPrgrsRt(0.0);
				if (!isEmptyStudent(dto)) {
					students.add(dto);
				}
			}
			return students;
		} catch (IOException e) {
			throw e;
		} catch (Exception e) {
			throw new IllegalArgumentException("학생명단 엑셀 파일을 읽을 수 없습니다.");
		}
	}

	private String cellValue(Row row, int index, DataFormatter formatter) {
		String value = formatter.formatCellValue(row.getCell(index));
		return normalize(value);
	}

	private String programType(String value) {
		String normalized = normalizeRequired(value, "프로그램 구분");
		if ("미션".equals(normalized) || "MISSION".equalsIgnoreCase(normalized)) {
			return "MISSION";
		}
		if ("사건탐구".equals(normalized) || "EXPLORE".equalsIgnoreCase(normalized)) {
			return "EXPLORE";
		}
		throw new IllegalArgumentException("프로그램 구분은 미션 또는 사건탐구로 입력하세요.");
	}

	private Integer programSn(String prgrmTypeCd, String prgrmNm) {
		String normalizedName = normalizeRequired(prgrmNm, "프로그램명");
		Integer prgrmSn = learningReservationDAO.selectProgramSnByName(prgrmTypeCd, normalizedName);
		if (prgrmSn == null) {
			throw new IllegalArgumentException("등록된 프로그램을 찾을 수 없습니다: " + normalizedName);
		}
		return prgrmSn;
	}

	private Integer parseInt(String value) {
		String normalized = normalize(value);
		if (normalized == null) {
			return 0;
		}
		String digits = normalized.replaceAll("[^0-9]", "");
		return digits.isEmpty() ? 0 : Integer.parseInt(digits);
	}

	private LearningReservationStudentVO toStudent(Integer rsvtSn, int index, LearningReservationStudentDto dto, String adminId) {
		return LearningReservationStudentVO.builder()
			.stdntSn(dto.getStdntSn())
			.rsvtSn(rsvtSn)
			.stdntNo(normalize(dto.getStdntNo()) == null ? String.valueOf(index) : normalize(dto.getStdntNo()))
			.clasNm(normalize(dto.getClasNm()))
			.clasNo(normalize(dto.getClasNo()))
			.stdntNm(normalize(dto.getStdntNm()))
			.atndYn(yn(dto.getAtndYn(), "N"))
			.teamNm(normalize(dto.getTeamNm()))
			.asgnNm(normalize(dto.getAsgnNm()))
			.routeCn(normalize(dto.getRouteCn()))
			.lrnSttsCd(lrnStatus(dto.getLrnSttsCd()))
			.prgrsRt(dto.getPrgrsRt() == null ? 0 : Math.max(0, Math.min(100, dto.getPrgrsRt())))
			.rgtr(adminId)
			.mdtr(adminId)
			.build();
	}

	private boolean isEmptyStudent(LearningReservationStudentDto dto) {
		return dto == null
			|| (normalize(dto.getStdntNm()) == null
				&& normalize(dto.getClasNm()) == null
				&& normalize(dto.getClasNo()) == null
				&& normalize(dto.getTeamNm()) == null
				&& normalize(dto.getAsgnNm()) == null
				&& normalize(dto.getRouteCn()) == null);
	}

	private String generateReservationNo(LocalDate rsvtYmd) {
		String prefix = rsvtYmd.format(RSVT_NO_DATE);
		Integer nextSeq = learningReservationDAO.selectNextReservationSeq(prefix);
		return prefix + "-" + String.format("%05d", nextSeq == null ? 1 : nextSeq);
	}

	private String normalizeRequired(String value, String label) {
		String normalized = normalize(value);
		if (normalized == null) {
			throw new IllegalArgumentException(label + "을(를) 입력하세요.");
		}
		return normalized;
	}

	private String normalizeNumberRequired(String value, String label) {
		String normalized = normalizeRequired(value, label);
		if (!normalized.matches("\\d+")) {
			throw new IllegalArgumentException(label + "은(는) 숫자만 입력하세요.");
		}
		return normalized;
	}

	private Integer requiredPositive(Integer value, String label) {
		if (value == null || value < 1) {
			throw new IllegalArgumentException(label + "을(를) 선택하세요.");
		}
		return value;
	}

	private Integer nonNegative(Integer value, String label) {
		if (value == null) {
			return 0;
		}
		if (value < 0) {
			throw new IllegalArgumentException(label + "은(는) 0 이상으로 입력하세요.");
		}
		return value;
	}

	private String normalize(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		return value.trim();
	}

	private String lrnStatus(String value) {
		String normalized = normalize(value);
		return List.of("READY", "ING", "DONE").contains(normalized) ? normalized : "READY";
	}

	private String yn(String value, String defaultValue) {
		return "Y".equalsIgnoreCase(value) ? "Y" : "N".equalsIgnoreCase(value) ? "N" : defaultValue;
	}
}
