package egovframework.let.adm.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import egovframework.let.adm.service.EgovEducationProgramStatsService;
import egovframework.let.adm.service.vo.EducationProgramStatsSourceVO;
import egovframework.let.adm.service.vo.EducationProgramStatsVO;
import jakarta.annotation.Resource;

@Service("egovEducationProgramStatsService")
public class EgovEducationProgramStatsServiceImpl extends EgovAbstractServiceImpl implements EgovEducationProgramStatsService {
	private static final Pattern QUEST_STEP = Pattern.compile("^QUEST\\d+$");
	private static final Pattern MISSION_STEP = Pattern.compile("^MISSION\\d+$");

	@Resource(name = "educationProgramStatsDAO")
	private EducationProgramStatsDAO educationProgramStatsDAO;

	@Resource
	private ObjectMapper objectMapper;

	@Override
	public List<EducationProgramStatsVO> getEducationProgramStats(String startDate, String endDate) {
		Map<String, ProgramAccumulator> programs = new LinkedHashMap<>();
		for (EducationProgramStatsSourceVO source : educationProgramStatsDAO.selectStatsSources(startDate, endDate)) {
			String key = source.getProgramTypeCd() + ":" + source.getProgramSn();
			ProgramAccumulator program = programs.computeIfAbsent(key, ignored -> new ProgramAccumulator(source));
			if (source.getStudentSn() != null) program.students.add(source);
		}

		return programs.values().stream().map(this::toStats).toList();
	}

	private EducationProgramStatsVO toStats(ProgramAccumulator program) {
		int dynamicCount = configuredDynamicCount(program.source);
		List<double[]> studentRates = program.students.stream()
			.map(student -> studentRates(program.source.getProgramTypeCd(), student, dynamicCount))
			.toList();

		return EducationProgramStatsVO.builder()
			.programTypeCd(program.source.getProgramTypeCd())
			.programTypeNm(program.source.getProgramTypeNm())
			.programSn(program.source.getProgramSn())
			.programNm(program.source.getProgramNm())
			.step1CompletionRate(average(studentRates, 0))
			.step2CompletionRate(average(studentRates, 1))
			.step3CompletionRate(average(studentRates, 2))
			.step4CompletionRate(average(studentRates, 3))
			.build();
	}

	private double[] studentRates(String programTypeCd, EducationProgramStatsSourceVO student, int configuredDynamicCount) {
		Set<String> doneSteps = doneSteps(student.getDoneStepCodes());
		boolean legacyCompleted = doneSteps.isEmpty()
			&& "DONE".equals(student.getLearningStatusCd())
			&& number(student.getProgressRate()) >= 100;
		boolean hasAnyProgress = legacyCompleted || !doneSteps.isEmpty() || number(student.getProgressRate()) > 0;
		double[] rates = new double[4];
		rates[0] = doneSteps.contains("STEP1") || hasAnyProgress ? 100 : 0;

		if ("EXPLORE".equals(programTypeCd)) {
			rates[1] = legacyCompleted ? 100 : dynamicRate(doneSteps, QUEST_STEP, configuredDynamicCount);
			rates[2] = legacyCompleted || doneSteps.contains("STEP3") ? 100 : 0;
		} else if ("MISSION".equals(programTypeCd)) {
			boolean missionStarted = legacyCompleted || doneSteps.stream().anyMatch(code -> MISSION_STEP.matcher(code).matches());
			rates[1] = doneSteps.contains("STEP2") || missionStarted ? 100 : 0;
			rates[2] = legacyCompleted ? 100 : dynamicRate(doneSteps, MISSION_STEP, configuredDynamicCount);
		} else {
			rates[1] = legacyCompleted || doneSteps.contains("STEP2") ? 100 : 0;
			rates[2] = legacyCompleted || doneSteps.contains("STEP3") ? 100 : 0;
		}
		rates[3] = legacyCompleted || doneSteps.contains("STEP4") ? 100 : 0;
		return rates;
	}

	private double dynamicRate(Set<String> doneSteps, Pattern pattern, int configuredCount) {
		long completedCount = doneSteps.stream().filter(code -> pattern.matcher(code).matches()).count();
		int denominator = configuredCount > 0 ? configuredCount : maxStepNumber(doneSteps, pattern);
		if (denominator <= 0) return 0;
		return Math.min(100, completedCount * 100d / denominator);
	}

	private int configuredDynamicCount(EducationProgramStatsSourceVO source) {
		String targetStep = "MISSION".equals(source.getProgramTypeCd()) ? "STEP3" : "STEP2";
		if (source.getStepJson() == null || source.getStepJson().isBlank()) return 0;
		try {
			JsonNode steps = objectMapper.readTree(source.getStepJson());
			if (!steps.isArray()) return 0;
			for (JsonNode step : steps) {
				if (!targetStep.equalsIgnoreCase(step.path("step").asText())) continue;
				JsonNode quests = step.path("quests");
				if (!quests.isArray()) return 0;
				int count = 0;
				for (JsonNode quest : quests) {
					if (!quest.path("name").asText("").isBlank() || !quest.path("title").asText("").isBlank()) count++;
				}
				return count;
			}
		} catch (Exception ignored) {
			return 0;
		}
		return 0;
	}

	private int maxStepNumber(Set<String> doneSteps, Pattern pattern) {
		return doneSteps.stream()
			.filter(code -> pattern.matcher(code).matches())
			.map(code -> code.replaceAll("\\D", ""))
			.filter(value -> !value.isBlank())
			.mapToInt(Integer::parseInt)
			.max()
			.orElse(0);
	}

	private Set<String> doneSteps(String value) {
		if (value == null || value.isBlank()) return Set.of();
		return Arrays.stream(value.split(","))
			.map(String::trim)
			.filter(code -> !code.isBlank())
			.collect(Collectors.toCollection(LinkedHashSet::new));
	}

	private double average(List<double[]> rates, int index) {
		if (rates.isEmpty()) return 0;
		double value = rates.stream().mapToDouble(rate -> rate[index]).average().orElse(0);
		return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
	}

	private double number(BigDecimal value) {
		return value == null ? 0 : value.doubleValue();
	}

	private static class ProgramAccumulator {
		private final EducationProgramStatsSourceVO source;
		private final List<EducationProgramStatsSourceVO> students = new ArrayList<>();

		private ProgramAccumulator(EducationProgramStatsSourceVO source) {
			this.source = source;
		}
	}
}
