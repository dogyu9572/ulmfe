package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.BbsPostVO;
import egovframework.let.adm.service.impl.BbsPostDAO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovBbsPostService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Slf4j
@Service("egovBbsPostService")
public class EgovBbsPostServiceImpl extends EgovAbstractServiceImpl implements EgovBbsPostService {

	@Resource(name = "bbsPostDAO")
	private BbsPostDAO bbsPostDAO;

	public List<BbsPostVO> getBbsPostListForAdmin(String bbsId, int page, int size) {
		int offset = (page - 1) * size;
		return bbsPostDAO.selectBbsPostListForAdmin(bbsId, offset, size);
	}

	public int getBbsPostCountForAdmin(String bbsId) {
		return bbsPostDAO.selectBbsPostCountForAdmin(bbsId);
	}

	public List<BbsPostVO> getBbsPostListForAdmin(String bbsId, int page, int size,
			String searchType, String searchKeyword, String category, String startDate, String endDate) {
		int offset = (page - 1) * size;
		boolean hasSearch = (searchKeyword != null && !searchKeyword.isBlank())
				|| (category != null && !category.isBlank())
				|| (startDate != null && !startDate.isBlank())
				|| (endDate != null && !endDate.isBlank());
		if (hasSearch) {
			return bbsPostDAO.selectBbsPostListForAdminSearch(
					bbsId, searchType, searchKeyword, category, startDate, endDate, offset, size);
		}
		return bbsPostDAO.selectBbsPostListForAdmin(bbsId, offset, size);
	}

	public int getBbsPostCountForAdmin(String bbsId,
			String searchType, String searchKeyword, String category, String startDate, String endDate) {
		boolean hasSearch = (searchKeyword != null && !searchKeyword.isBlank())
				|| (category != null && !category.isBlank())
				|| (startDate != null && !startDate.isBlank())
				|| (endDate != null && !endDate.isBlank());
		if (hasSearch) {
			return bbsPostDAO.selectBbsPostCountForAdminSearch(
					bbsId, searchType, searchKeyword, category, startDate, endDate);
		}
		return bbsPostDAO.selectBbsPostCountForAdmin(bbsId);
	}

	public BbsPostVO getBbsPostById(String bbsId, String pstSn) {
		BbsPostVO result = bbsPostDAO.selectBbsPostById(bbsId, pstSn);
		if (result == null) {
			throw new RuntimeException("게시글을 찾을 수 없습니다.");
		}
		return result;
	}

	@Transactional
	public BbsPostVO createBbsPost(BbsPostVO bbsPost) {
		String pstSn = generatePostId(bbsPost.getBbsId());
		bbsPost.setPstSn(pstSn);
		setDefaultValues(bbsPost);
		bbsPost.setRegdt(LocalDateTime.now());
		bbsPost.setMdfcnDt(LocalDateTime.now());
		if (bbsPost.getPstgYmd() == null || bbsPost.getPstgYmd().isEmpty()) {
			bbsPost.setPstgYmd(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
		}
		int rows = bbsPostDAO.insertBbsPost(bbsPost);
		if (rows <= 0) {
			throw new RuntimeException("게시글 등록에 실패했습니다.");
		}
		return bbsPost;
	}

	@Transactional
	public BbsPostVO updateBbsPost(BbsPostVO bbsPost) {
		if (bbsPostDAO.selectBbsPostById(bbsPost.getBbsId(), bbsPost.getPstSn()) == null) {
			throw new RuntimeException("수정할 게시글을 찾을 수 없습니다.");
		}
		setDefaultValues(bbsPost);
		bbsPost.setMdfcnDt(LocalDateTime.now());
		int rows = bbsPostDAO.updateBbsPost(bbsPost);
		if (rows <= 0) {
			throw new RuntimeException("게시글 수정에 실패했습니다.");
		}
		return getBbsPostById(bbsPost.getBbsId(), bbsPost.getPstSn());
	}

	@Transactional
	public BbsPostVO updateBbsPostAnswer(BbsPostVO bbsPost) {
		if (bbsPostDAO.selectBbsPostById(bbsPost.getBbsId(), bbsPost.getPstSn()) == null) {
			throw new RuntimeException("답변할 게시글을 찾을 수 없습니다.");
		}
		String answerStatus = bbsPost.getAnsSttsCd();
		if (answerStatus == null || answerStatus.isBlank()) {
			answerStatus = "WAIT";
		}
		answerStatus = "DONE".equalsIgnoreCase(answerStatus) ? "DONE" : "WAIT";
		bbsPost.setAnsSttsCd(answerStatus);
		if ("WAIT".equals(answerStatus)) {
			bbsPost.setAnsCn(null);
			bbsPost.setAnswrNm(null);
			bbsPost.setAnswrId(null);
			bbsPost.setAnsYmd(null);
		} else if (bbsPost.getAnsCn() == null || bbsPost.getAnsCn().isBlank()) {
			throw new RuntimeException("답변내용을 입력하세요.");
		}
		bbsPost.setMdfcnDt(LocalDateTime.now());
		int rows = bbsPostDAO.updateBbsPostAnswer(bbsPost);
		if (rows <= 0) {
			throw new RuntimeException("답변 저장에 실패했습니다.");
		}
		return bbsPost;
	}

	@Transactional
	public void deleteBbsPost(String bbsId, String pstSn) {
		if (bbsPostDAO.selectBbsPostById(bbsId, pstSn) == null) {
			throw new RuntimeException("삭제할 게시글을 찾을 수 없습니다.");
		}
		int rows = bbsPostDAO.deleteBbsPost(bbsId, pstSn);
		if (rows <= 0) {
			throw new RuntimeException("게시글 삭제에 실패했습니다.");
		}
	}

	@Transactional
	public void incrementViewCount(String bbsId, String pstSn) {
		bbsPostDAO.updateViewCount(bbsId, pstSn);
	}

	private String generatePostId(String bbsId) {
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		Random random = new Random();
		StringBuilder sb = new StringBuilder();
		do {
			sb.setLength(0);
			for (int i = 0; i < 10; i++) {
				sb.append(chars.charAt(random.nextInt(chars.length())));
			}
		} while (bbsPostDAO.checkPostIdExists(bbsId, sb.toString()) > 0);
		return sb.toString();
	}

	private void setDefaultValues(BbsPostVO bbsPost) {
		if (bbsPost.getNtcYn() == null) bbsPost.setNtcYn("N");
		if (bbsPost.getUpendFixYn() == null) bbsPost.setUpendFixYn("N");
		if (bbsPost.getLckYn() == null) bbsPost.setLckYn("N");
		if (bbsPost.getUseYn() == null) bbsPost.setUseYn("Y");
		if (bbsPost.getInqCnt() == null) bbsPost.setInqCnt(0);
		if (bbsPost.getSortSeq() == null) bbsPost.setSortSeq(0);
		if (bbsPost.getAnsSttsCd() == null) bbsPost.setAnsSttsCd("WAIT");
		if (bbsPost.getWrtrId() == null || bbsPost.getWrtrId().isBlank()) {
			String fallbackId = bbsPost.getRgtr();
			if (fallbackId == null || fallbackId.isBlank()) {
				fallbackId = bbsPost.getMdtr();
			}
			bbsPost.setWrtrId((fallbackId == null || fallbackId.isBlank()) ? "admin" : fallbackId);
		}
	}
}
