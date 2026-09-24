// 정기휴관 요일 규칙과 관리자 등록 기간을 합쳐 해당 월의 휴관 일자를 계산하는 서비스
package egovframework.let.usr.service.impl;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.usr.service.EgovPublicClosedDayService;
import egovframework.let.usr.service.vo.PublicClosedDayMonthVO;
import egovframework.let.usr.service.vo.PublicClosedDayVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("egovPublicClosedDayService")
@RequiredArgsConstructor
public class EgovPublicClosedDayServiceImpl implements EgovPublicClosedDayService {

	/** 서버 OS 타임존이 UTC 라서, 이번 달 판정은 한국 시간대를 명시해야 월초 9시간 동안 지난달이 나오지 않는다. */
	private static final ZoneId KST = ZoneId.of("Asia/Seoul");
	private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	/** ISO-8601 기준 1(월) ~ 7(일) */
	private static final String[] DAY_NAMES = { "월", "화", "수", "목", "금", "토", "일" };

	private final PublicClosedDayDAO publicClosedDayDAO;

	@Override
	@Transactional(readOnly = true)
	public PublicClosedDayMonthVO getClosedDaysOfMonth(String month) {
		YearMonth target = parseMonth(month);
		LocalDate firstDay = target.atDay(1);
		LocalDate lastDay = target.atEndOfMonth();

		Set<Integer> regularDays = parseRegularDays(publicClosedDayDAO.selectRegularClosedDayCode());
		List<PublicClosedDayVO> registered = publicClosedDayDAO.selectClosedDaysInRange(
				firstDay.format(DATE_FORMAT), lastDay.format(DATE_FORMAT));

		List<Integer> days = new ArrayList<>();
		for (LocalDate date = firstDay; !date.isAfter(lastDay); date = date.plusDays(1)) {
			if (isClosed(date, regularDays, registered)) {
				days.add(date.getDayOfMonth());
			}
		}

		return new PublicClosedDayMonthVO(target.format(MONTH_FORMAT), days, buildNoticeText(regularDays));
	}

	/**
	 * 정기휴관 요일이거나 휴관(C) 기간에 포함되면 휴관으로 보되,
	 * 임시개관(O) 기간에 포함된 날은 규칙보다 우선해서 개관으로 처리한다.
	 */
	private boolean isClosed(LocalDate date, Set<Integer> regularDays, List<PublicClosedDayVO> registered) {
		boolean closed = regularDays.contains(date.getDayOfWeek().getValue());
		for (PublicClosedDayVO period : registered) {
			if (!contains(period, date)) {
				continue;
			}
			if ("O".equals(period.getClsrSeCd())) {
				return false;
			}
			closed = true;
		}
		return closed;
	}

	private boolean contains(PublicClosedDayVO period, LocalDate date) {
		LocalDate begin = period.getBgngYmd();
		LocalDate end = period.getEndYmd() != null ? period.getEndYmd() : begin;
		return begin != null && !date.isBefore(begin) && !date.isAfter(end);
	}

	private YearMonth parseMonth(String month) {
		if (month == null || month.isBlank()) {
			return YearMonth.now(KST);
		}
		try {
			return YearMonth.parse(month.trim(), MONTH_FORMAT);
		} catch (Exception e) {
			log.warn("휴관일 조회 월 형식이 올바르지 않아 이번 달로 대체합니다: {}", month);
			return YearMonth.now(KST);
		}
	}

	/** 콤마로 구분된 요일 코드에서 1(월)~7(일)만 남긴다. TreeSet 이라 이후 사용처는 정렬을 신경 쓰지 않아도 된다. */
	private Set<Integer> parseRegularDays(String code) {
		if (code == null || code.isBlank()) {
			return Set.of();
		}
		return Stream.of(code.split(","))
				.map(String::trim)
				.filter(token -> token.matches("[1-7]"))
				.map(Integer::valueOf)
				.collect(Collectors.toCollection(TreeSet::new));
	}

	private String buildNoticeText(Set<Integer> regularDays) {
		if (regularDays.isEmpty()) {
			return "※ 법정공휴일 휴관";
		}
		String names = regularDays.stream()
				.map(day -> DAY_NAMES[day - 1])
				.collect(Collectors.joining(", "));
		return "※ 매주 " + names + "요일 및 법정공휴일 휴관";
	}
}
