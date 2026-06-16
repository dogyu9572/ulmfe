package egovframework.let.adm.service.impl;

import java.time.Year;
import java.util.Map;

import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import egovframework.let.adm.service.EgovHomepageHistoryService;
import egovframework.let.adm.service.vo.HomepageHistoryVO;
import egovframework.let.adm.service.vo.PageListResult;
import jakarta.annotation.Resource;

@Service("egovHomepageHistoryService")
public class EgovHomepageHistoryServiceImpl extends EgovAbstractServiceImpl implements EgovHomepageHistoryService {
	@Resource(name = "homepageHistoryDAO")
	private HomepageHistoryDAO homepageHistoryDAO;

	@Override
	public Map<String, Object> getHistoryList(String searchKeyword, String useYn, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = homepageHistoryDAO.selectHistoryCount(searchKeyword, useYn);
		return PageListResult.of(
			homepageHistoryDAO.selectHistoryList(searchKeyword, useYn, offset, safeSize),
			totalCount,
			safePage,
			safeSize
		);
	}

	@Override
	public HomepageHistoryVO getHistory(Integer hstrySn) {
		return hstrySn != null ? homepageHistoryDAO.selectHistory(hstrySn) : null;
	}

	@Override
	@Transactional
	public HomepageHistoryVO saveHistory(HomepageHistoryVO history) {
		validate(history);
		history.setHstryYr(history.getHstryYr().trim());
		history.setHstryMm(String.format("%02d", Integer.parseInt(history.getHstryMm().trim())));
		history.setUseYn("N".equalsIgnoreCase(history.getUseYn()) ? "N" : "Y");
		if (history.getHstrySn() == null) {
			homepageHistoryDAO.insertHistory(history);
		} else {
			homepageHistoryDAO.updateHistory(history);
		}
		return getHistory(history.getHstrySn());
	}

	@Override
	@Transactional
	public void deleteHistory(Integer hstrySn, String deltr) {
		if (hstrySn == null) {
			throw new IllegalArgumentException("삭제할 연혁 번호가 없습니다.");
		}
		homepageHistoryDAO.deleteHistory(hstrySn, deltr);
	}

	@Override
	@Transactional
	public void deleteHistories(java.util.List<Integer> hstrySns, String deltr) {
		if (hstrySns == null || hstrySns.isEmpty()) {
			throw new IllegalArgumentException("삭제할 연혁을 선택해주세요.");
		}
		homepageHistoryDAO.deleteHistories(hstrySns, deltr);
	}

	private void validate(HomepageHistoryVO history) {
		if (history == null) {
			throw new IllegalArgumentException("저장할 연혁 정보가 없습니다.");
		}
		String year = history.getHstryYr() != null ? history.getHstryYr().trim() : "";
		String month = history.getHstryMm() != null ? history.getHstryMm().trim() : "";
		if (!year.matches("\\d{4}")) {
			throw new IllegalArgumentException("연도는 4자리 숫자로 입력해주세요.");
		}
		int y = Integer.parseInt(year);
		if (y < 1900 || y > Year.now().getValue() + 10) {
			throw new IllegalArgumentException("연도 범위가 올바르지 않습니다.");
		}
		if (!month.matches("\\d{1,2}")) {
			throw new IllegalArgumentException("월은 숫자로 입력해주세요.");
		}
		int m = Integer.parseInt(month);
		if (m < 1 || m > 12) {
			throw new IllegalArgumentException("월은 1부터 12까지 입력할 수 있습니다.");
		}
		if (history.getHstryCn() == null || history.getHstryCn().trim().isEmpty()) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}
	}
}
