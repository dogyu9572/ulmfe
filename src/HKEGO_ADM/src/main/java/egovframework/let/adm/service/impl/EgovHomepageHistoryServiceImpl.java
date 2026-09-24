package egovframework.let.adm.service.impl;

import egovframework.let.adm.service.EgovFileInfoService;
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
	@Resource(name = "egovFileInfoService")
	private EgovFileInfoService fileInfoService;

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
		history.setHstryMm(history.getHstryMm().trim());
		history.setUseYn("N".equalsIgnoreCase(history.getUseYn()) ? "N" : "Y");
		if (history.getHstrySn() == null) {
			homepageHistoryDAO.insertHistory(history);
		} else {
			// 다른 운영자가 먼저 지운 연혁이면 수정할 대상이 없다. 조용히 성공으로 처리하면
			// 화면에는 저장된 것처럼 보이지만 실제로는 아무것도 바뀌지 않는다.
			if (homepageHistoryDAO.selectHistory(history.getHstrySn()) == null) {
				throw new IllegalArgumentException("연혁을 찾을 수 없습니다.");
			}
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
		HomepageHistoryVO target = homepageHistoryDAO.selectHistory(hstrySn);
		homepageHistoryDAO.deleteHistory(hstrySn, deltr);
		// 연혁을 지워도 이미지가 남으면 주소를 아는 사람이 계속 받을 수 있다.
		if (target != null) {
			fileInfoService.deleteFileGroup(target.getImgFileId());
		}
	}

	@Override
	@Transactional
	public void deleteHistories(java.util.List<Integer> hstrySns, String deltr) {
		if (hstrySns == null || hstrySns.isEmpty()) {
			throw new IllegalArgumentException("삭제할 연혁을 선택해주세요.");
		}
		java.util.List<String> fileIds = new java.util.ArrayList<>();
		for (Integer sn : hstrySns) {
			HomepageHistoryVO target = homepageHistoryDAO.selectHistory(sn);
			if (target != null && target.getImgFileId() != null) {
				fileIds.add(target.getImgFileId());
			}
		}
		homepageHistoryDAO.deleteHistories(hstrySns, deltr);
		for (String fileId : fileIds) {
			fileInfoService.deleteFileGroup(fileId);
		}
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
		if (month.isEmpty()) {
			throw new IllegalArgumentException("시점을 입력해주세요.");
		}
		if (month.length() > 40) {
			throw new IllegalArgumentException("시점은 40자 이내로 입력해주세요.");
		}
		if (history.getHstryCn() == null || history.getHstryCn().trim().isEmpty()) {
			throw new IllegalArgumentException("내용을 입력해주세요.");
		}
	}
}
