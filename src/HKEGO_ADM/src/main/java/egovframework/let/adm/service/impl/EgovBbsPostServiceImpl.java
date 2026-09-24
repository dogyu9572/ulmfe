package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.com.cmm.util.HtmlSanitizer;
import egovframework.let.adm.service.vo.BbsPostVO;
import egovframework.let.adm.service.impl.BbsPostDAO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovBbsPostService;
import egovframework.let.adm.service.EgovFileInfoService;
import egovframework.let.adm.service.vo.FileInfoVO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Random;

@Slf4j
@Service("egovBbsPostService")
public class EgovBbsPostServiceImpl extends EgovAbstractServiceImpl implements EgovBbsPostService {

	@Resource(name = "bbsPostDAO")
	private BbsPostDAO bbsPostDAO;

	@Resource(name = "egovFileInfoService")
	private EgovFileInfoService fileInfoService;

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
			throw new IllegalArgumentException("게시글을 찾을 수 없습니다.");
		}
		return result;
	}

	@Transactional
	public BbsPostVO createBbsPost(BbsPostVO bbsPost) {
		validate(bbsPost);
		bbsPost.setInqCnt(0);
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
		validate(bbsPost);
		BbsPostVO existing = bbsPostDAO.selectBbsPostById(bbsPost.getBbsId(), bbsPost.getPstSn());
		if (existing == null) {
			throw new IllegalArgumentException("수정할 게시글을 찾을 수 없습니다.");
		}
		// 작성자는 등록 시점 값을 유지한다. 수정하는 관리자가 원 작성자를 덮어쓰지 않게 한다.
		bbsPost.setWrtrId(existing.getWrtrId());
		bbsPost.setWrtrNm(existing.getWrtrNm());
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
			throw new IllegalArgumentException("답변할 게시글을 찾을 수 없습니다.");
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
			throw new IllegalArgumentException("답변내용을 입력하세요.");
		} else {
			bbsPost.setAnsCn(HtmlSanitizer.clean(bbsPost.getAnsCn()));
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
		BbsPostVO target = bbsPostDAO.selectBbsPostById(bbsId, pstSn);
		if (target == null) {
			throw new IllegalArgumentException("삭제할 게시글을 찾을 수 없습니다.");
		}
		int rows = bbsPostDAO.deleteBbsPost(bbsId, pstSn);
		if (rows <= 0) {
			throw new RuntimeException("게시글 삭제에 실패했습니다.");
		}
		// 첨부만 지우면 썸네일·영상 파일이 고아로 남아 URL 로 계속 접근된다.
		fileInfoService.deleteFileGroup(target.getAtchFileMngNo());
		fileInfoService.deleteFileGroup(target.getThmbFileId());
		fileInfoService.deleteFileGroup(target.getVodFileId());
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

	/** 화면 검증을 우회한 API 직접 호출도 같은 규칙으로 막는다. */
	private void validate(BbsPostVO bbsPost) {
		String title = bbsPost.getPstTtl();
		if (title == null || title.isBlank()) {
			throw new IllegalArgumentException("제목을 입력하세요.");
		}
		bbsPost.setPstTtl(title.trim());
		bbsPost.setPstCn(HtmlSanitizer.clean(bbsPost.getPstCn()));
		maxLength(bbsPost.getPstTtl(), 500, "제목");
		maxLength(bbsPost.getWrtrNm(), 100, "작성자명");
		maxLength(bbsPost.getWrtrId(), 100, "작성자ID");
		maxLength(bbsPost.getCtgrCd(), 100, "카테고리");
		maxLength(bbsPost.getLnkgUrlAddr(), 1000, "링크");
		yesOrNo(bbsPost.getNtcYn(), "공지사항 여부");
		yesOrNo(bbsPost.getUpendFixYn(), "상단고정 여부");
		yesOrNo(bbsPost.getLckYn(), "비밀글 여부");
		yesOrNo(bbsPost.getUseYn(), "사용여부");
		yyyyMmDd(bbsPost.getPstgYmd(), "등록일자");
		yyyyMmDd(bbsPost.getAnsYmd(), "답변일자");
	}

	private void maxLength(String value, int limit, String label) {
		if (value != null && value.length() > limit) {
			throw new IllegalArgumentException(label + "은(는) " + limit + "자 이내로 입력하세요.");
		}
	}

	private void yesOrNo(String value, String label) {
		if (value != null && !value.isBlank() && !"Y".equals(value) && !"N".equals(value)) {
			throw new IllegalArgumentException(label + "은(는) Y 또는 N 이어야 합니다.");
		}
	}

	private void yyyyMmDd(String value, String label) {
		if (value == null || value.isBlank()) {
			return;
		}
		try {
			LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
		} catch (DateTimeParseException e) {
			throw new IllegalArgumentException(label + "은(는) yyyy-MM-dd 형식이어야 합니다.");
		}
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
