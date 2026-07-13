package egovframework.let.adm.web;

import egovframework.let.adm.service.vo.EvaluationFormVO;
import egovframework.let.adm.service.vo.EvaluationQuestionVO;
import egovframework.let.adm.service.vo.QuestionnaireResponseVO;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.WorkbookUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class QuestionnaireResultExcelWriter {
	private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

	private QuestionnaireResultExcelWriter() {
	}

	static byte[] create(EvaluationFormVO form, List<QuestionnaireResponseVO> responseRows, boolean survey) throws Exception {
		try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			String fallbackName = survey ? "만족도조사" : "평가지";
			String sheetName = WorkbookUtil.createSafeSheetName(form.getQstnrNm() == null ? fallbackName : form.getQstnrNm());
			Sheet sheet = workbook.createSheet(sheetName);
			sheet.createFreezePane(0, 1);

			List<QuestionnaireResponseVO> safeResponseRows = responseRows == null ? List.of() : responseRows;
			List<EvaluationQuestionVO> questions = form.getQuestions() == null ? List.of() : form.getQuestions();
			List<String> headers = new ArrayList<>();
			headers.add("응답번호");
			headers.add("제출일시");
			if (survey) {
				headers.add("참여구분");
				headers.add("학교급");
				headers.add("성별");
				headers.add("거주지");
			}
			for (EvaluationQuestionVO question : questions) {
				headers.add(questionHeader(question));
			}

			CellStyle headerStyle = headerStyle(workbook);
			Row header = sheet.createRow(0);
			header.setHeightInPoints(36);
			for (int i = 0; i < headers.size(); i++) {
				Cell cell = header.createCell(i);
				cell.setCellValue(headers.get(i));
				cell.setCellStyle(headerStyle);
				sheet.setColumnWidth(i, i < 2 ? (i == 0 ? 10 : 18) * 256 : 22 * 256);
			}

			Map<String, ResponseRow> responses = new LinkedHashMap<>();
			for (QuestionnaireResponseVO response : safeResponseRows) {
				ResponseRow row = responses.computeIfAbsent(response.getResponseKey(), key -> new ResponseRow());
				row.accept(response);
			}

			int rowIndex = 1;
			int responseNo = 1;
			for (ResponseRow response : responses.values()) {
				Row row = sheet.createRow(rowIndex++);
				int columnIndex = 0;
				row.createCell(columnIndex++).setCellValue(responseNo++);
				row.createCell(columnIndex++).setCellValue(formatDateTime(response.submittedDt));
				if (survey) {
					row.createCell(columnIndex++).setCellValue(value(response.participationType));
					row.createCell(columnIndex++).setCellValue(value(response.schoolLevel));
					row.createCell(columnIndex++).setCellValue(value(response.gender));
					row.createCell(columnIndex++).setCellValue(value(response.residence));
				}
				for (int questionIndex = 0; questionIndex < questions.size(); questionIndex++) {
					row.createCell(columnIndex++).setCellValue(normalizeAnswer(response.answerFor(questions.get(questionIndex), questionIndex)));
				}
			}

			workbook.write(out);
			return out.toByteArray();
		}
	}

	private static String questionHeader(EvaluationQuestionVO question) {
		String number = value(question.getQstnNo()).trim();
		String content = value(question.getQstnCn()).trim();
		if (number.isEmpty() || number.equals(content)) return content;
		if (content.isEmpty()) return number;
		return number + ". " + content;
	}

	private static CellStyle headerStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setBold(true);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		style.setWrapText(true);
		style.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		return style;
	}

	private static String normalizeAnswer(String answer) {
		String normalized = value(answer).trim();
		if (normalized.isEmpty() || normalized.matches("^[1-5]\\s*\\(.*\\)$")) {
			return normalized;
		}
		return switch (normalized.replace(" ", "")) {
			case "매우아니다", "매우그렇지않다", "매우부족", "매우낮다" -> "1 (" + normalized + ")";
			case "아니다", "그렇지않다", "부족", "낮다" -> "2 (" + normalized + ")";
			case "보통", "보통이다", "적당하다", "적당했습니다" -> "3 (" + normalized + ")";
			case "그렇다", "충분", "높다" -> "4 (" + normalized + ")";
			case "매우그렇다", "매우충분", "매우높다" -> "5 (" + normalized + ")";
			default -> normalized;
		};
	}

	private static String formatDateTime(LocalDateTime value) {
		return value == null ? "" : value.format(DATE_TIME_FORMAT);
	}

	private static String value(Object value) {
		return value == null ? "" : String.valueOf(value);
	}

	private static final class ResponseRow {
		private LocalDateTime submittedDt;
		private String participationType;
		private String schoolLevel;
		private String gender;
		private String residence;
		private final Map<Integer, String> answers = new LinkedHashMap<>();
		private final List<AnswerValue> orderedAnswers = new ArrayList<>();

		private void accept(QuestionnaireResponseVO source) {
			if (submittedDt == null || source.getSubmittedDt() != null && source.getSubmittedDt().isAfter(submittedDt)) {
				submittedDt = source.getSubmittedDt();
			}
			participationType = firstValue(participationType, source.getParticipationType());
			schoolLevel = firstValue(schoolLevel, source.getSchoolLevel());
			gender = firstValue(gender, source.getGender());
			residence = firstValue(residence, source.getResidence());
			if (source.getQstnSn() != null) {
				answers.put(source.getQstnSn(), source.getAnsCn());
			}
			orderedAnswers.add(new AnswerValue(source.getQstnCn(), source.getAnsCn()));
		}

		private String answerFor(EvaluationQuestionVO question, int questionIndex) {
			String exact = answers.get(question.getQstnSn());
			if (exact != null) return exact;
			String currentContent = normalizeText(question.getQstnCn());
			String currentNumber = normalizeText(question.getQstnNo());
			for (AnswerValue answer : orderedAnswers) {
				String oldContent = normalizeText(answer.questionContent);
				if (!oldContent.isEmpty() && (oldContent.equals(currentContent) || oldContent.equals(currentNumber))) {
					return answer.answer;
				}
			}
			return questionIndex < orderedAnswers.size() ? orderedAnswers.get(questionIndex).answer : null;
		}

		private String firstValue(String current, String candidate) {
			return current != null && !current.isBlank() ? current : candidate;
		}

		private String normalizeText(String value) {
			return value == null ? "" : value.trim();
		}
	}

	private record AnswerValue(String questionContent, String answer) {
	}
}
