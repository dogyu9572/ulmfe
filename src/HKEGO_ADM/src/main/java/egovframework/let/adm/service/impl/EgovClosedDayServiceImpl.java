// 휴관일 CRUD와 정기휴관 요일 설정 저장을 처리하는 서비스 구현체
package egovframework.let.adm.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovClosedDayService;
import egovframework.let.adm.service.vo.ClosedDayVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("egovClosedDayService")
public class EgovClosedDayServiceImpl extends EgovAbstractServiceImpl implements EgovClosedDayService {

	@Resource(name = "closedDayDAO")
	private ClosedDayDAO closedDayDAO;

	@Override
	public Map<String, Object> getClosedDayListPage(
			String useYn, String clsrSeCd, String startDate, String endDate, String searchKeyword, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = closedDayDAO.selectClosedDayCount(useYn, clsrSeCd, startDate, endDate, searchKeyword);
		List<ClosedDayVO> list = closedDayDAO.selectClosedDayList(
				useYn, clsrSeCd, startDate, endDate, searchKeyword, offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	@Override
	public ClosedDayVO getClosedDayById(Long clsrSn) {
		ClosedDayVO closedDay = closedDayDAO.selectClosedDayById(clsrSn);
		if (closedDay == null) {
			throw new RuntimeException("휴관일을 찾을 수 없습니다.");
		}
		return closedDay;
	}

	@Override
	@Transactional
	public ClosedDayVO createClosedDay(ClosedDayVO request, String adminName) {
		ClosedDayVO closedDay = normalize(request);
		closedDay.setRgtrNm(adminName);
		closedDayDAO.insertClosedDay(closedDay);
		log.info("휴관일 등록: clsrSn={}", closedDay.getClsrSn());
		return closedDay;
	}

	@Override
	@Transactional
	public ClosedDayVO updateClosedDay(Long clsrSn, ClosedDayVO request, String adminName) {
		getClosedDayById(clsrSn);
		ClosedDayVO closedDay = normalize(request);
		closedDay.setClsrSn(clsrSn);
		closedDay.setMdfrNm(adminName);
		closedDayDAO.updateClosedDay(closedDay);
		return closedDayDAO.selectClosedDayById(clsrSn);
	}

	@Override
	@Transactional
	public void deleteClosedDay(Long clsrSn, String adminName) {
		getClosedDayById(clsrSn);
		closedDayDAO.deleteClosedDay(clsrSn, adminName);
		log.info("휴관일 삭제(논리): clsrSn={}", clsrSn);
	}

	@Override
	@Transactional
	public int deleteClosedDays(List<Long> clsrSnList, String adminName) {
		List<Long> targets = clsrSnList == null
				? List.of()
				: clsrSnList.stream().filter(Objects::nonNull).toList();
		return targets.isEmpty() ? 0 : closedDayDAO.deleteClosedDays(targets, adminName);
	}

	@Override
	public String getRegularClosedDayCode() {
		String code = closedDayDAO.selectRegularClosedDayCode();
		return code == null ? "" : code;
	}

	@Override
	@Transactional
	public String saveRegularClosedDayCode(String rglrClsrDayCd, String adminName) {
		String normalized = normalizeDayCode(rglrClsrDayCd);
		if (closedDayDAO.updateRegularClosedDayCode(normalized, adminName) == 0) {
			throw new RuntimeException("정기휴관 요일을 저장하지 못했습니다.");
		}
		return normalized;
	}

	/**
	 * 요청 본문에서 clsrSeCd·bgngYmd·endYmd·clsrResnCn·useYn 다섯 개만 취해 새 VO 를 만든다.
	 * 등록자·수정자·일련번호 같은 서버 소유 필드를 클라이언트가 덮어쓰지 못하게 막는 화이트리스트다.
	 * 아울러 시작일이 종료일보다 늦으면 뒤집고, 구분코드와 사용여부 기본값을 채운다.
	 */
	private ClosedDayVO normalize(ClosedDayVO request) {
		LocalDate bgngYmd = request.getBgngYmd();
		LocalDate endYmd = request.getEndYmd() != null ? request.getEndYmd() : bgngYmd;
		if (bgngYmd == null) {
			throw new IllegalArgumentException("시작일자를 입력해 주세요.");
		}
		if (endYmd.isBefore(bgngYmd)) {
			LocalDate swap = bgngYmd;
			bgngYmd = endYmd;
			endYmd = swap;
		}
		String seCd = "O".equals(request.getClsrSeCd()) ? "O" : "C";
		String useYn = "N".equals(request.getUseYn()) ? "N" : "Y";
		return ClosedDayVO.builder()
				.clsrSeCd(seCd)
				.bgngYmd(bgngYmd)
				.endYmd(endYmd)
				.clsrResnCn(request.getClsrResnCn())
				.useYn(useYn)
				.build();
	}

	/** 1(월)~7(일)만 남겨 중복 없이 오름차순 콤마 문자열로 만든다. 한 자리 숫자라 사전순이 곧 숫자순이다. */
	private String normalizeDayCode(String rglrClsrDayCd) {
		if (rglrClsrDayCd == null || rglrClsrDayCd.isBlank()) {
			return "";
		}
		List<String> tokens = Stream.of(rglrClsrDayCd.split(","))
				.map(String::trim)
				.filter(token -> !token.isEmpty())
				.toList();
		// 관리자 화면은 1~7 만 보내므로, 그 밖의 값은 요일 규칙이 어긋났다는 신호다. 조용히 버리면 설정이 사라진다.
		if (tokens.stream().anyMatch(token -> !token.matches("[1-7]"))) {
			throw new IllegalArgumentException("정기휴관 요일은 1(월)부터 7(일) 사이의 값이어야 합니다.");
		}
		return tokens.stream().distinct().sorted().collect(Collectors.joining(","));
	}
}
