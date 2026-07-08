package egovframework.let.adm.service.impl;

import jakarta.annotation.Resource;
import egovframework.let.adm.service.vo.PageListResult;
import egovframework.let.adm.service.vo.BbsMasterVO;
import egovframework.let.adm.service.impl.BbsMasterDAO;
import lombok.extern.slf4j.Slf4j;
import org.egovframe.rte.fdl.cmmn.EgovAbstractServiceImpl;

import egovframework.let.adm.service.EgovBbsMasterService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service("egovBbsMasterService")
public class EgovBbsMasterServiceImpl extends EgovAbstractServiceImpl implements EgovBbsMasterService {

	@Resource(name = "bbsMasterDAO")
	private BbsMasterDAO bbsMasterDAO;

	public Map<String, Object> getBbsMasterListPage(int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = bbsMasterDAO.countBbsMasterList();
		List<BbsMasterVO> list = bbsMasterDAO.selectBbsMasterList(offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	public BbsMasterVO getBbsMasterById(String bbsId) {
		BbsMasterVO result = bbsMasterDAO.selectBbsMasterById(bbsId);
		if (result == null) {
			throw new RuntimeException("게시판 마스터를 찾을 수 없습니다.");
		}
		return result;
	}

	@Transactional
	public BbsMasterVO createBbsMaster(BbsMasterVO bbsMaster, String adminId) {
		String bbsId = generateBbsId();
		String actorId = normalizeActorId(adminId);
		bbsMaster.setBbsId(bbsId);
		setDefaultValues(bbsMaster);
		bbsMaster.setRgtr(actorId);
		bbsMaster.setMdtr(actorId);
		bbsMaster.setRegDt(LocalDateTime.now());
		bbsMaster.setMdfcnDt(LocalDateTime.now());
		int rows = bbsMasterDAO.insertBbsMaster(bbsMaster);
		if (rows <= 0) {
			throw new RuntimeException("게시판 마스터 등록에 실패했습니다.");
		}
		return bbsMaster;
	}

	@Transactional
	public BbsMasterVO updateBbsMaster(BbsMasterVO bbsMaster, String adminId) {
		if (bbsMasterDAO.selectBbsMasterById(bbsMaster.getBbsId()) == null) {
			throw new RuntimeException("수정할 게시판 마스터를 찾을 수 없습니다.");
		}
		bbsMaster.setMdtr(normalizeActorId(adminId));
		bbsMaster.setMdfcnDt(LocalDateTime.now());
		int rows = bbsMasterDAO.updateBbsMaster(bbsMaster);
		if (rows <= 0) {
			throw new RuntimeException("게시판 마스터 수정에 실패했습니다.");
		}
		return bbsMaster;
	}

	@Transactional
	public void deleteBbsMaster(String bbsId) {
		if (bbsMasterDAO.selectBbsMasterById(bbsId) == null) {
			throw new RuntimeException("삭제할 게시판 마스터를 찾을 수 없습니다.");
		}
		int rows = bbsMasterDAO.deleteBbsMaster(bbsId);
		if (rows <= 0) {
			throw new RuntimeException("게시판 마스터 삭제에 실패했습니다.");
		}
	}

	public Map<String, Object> getActiveBbsMasterListPage(int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.min(Math.max(1, size), 100);
		int offset = (safePage - 1) * safeSize;
		int totalCount = bbsMasterDAO.countActiveBbsMasterList();
		List<BbsMasterVO> list = bbsMasterDAO.selectActiveBbsMasterList(offset, safeSize);
		return PageListResult.of(list, totalCount, safePage, safeSize);
	}

	private String generateBbsId() {
		String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		Random random = new Random();
		StringBuilder sb = new StringBuilder();
		do {
			sb.setLength(0);
			for (int i = 0; i < 5; i++) {
				sb.append(chars.charAt(random.nextInt(chars.length())));
			}
		} while (bbsMasterDAO.checkBbsIdExists(sb.toString()) > 0);
		return sb.toString();
	}

	private String normalizeActorId(String adminId) {
		return adminId == null || adminId.isBlank() ? "admin" : adminId;
	}

	private void setDefaultValues(BbsMasterVO bbsMaster) {
		if (bbsMaster.getAtchFileYn() == null) bbsMaster.setAtchFileYn("N");
		if (bbsMaster.getAtchFileCnt() == null) bbsMaster.setAtchFileCnt(0);
		if (bbsMaster.getUseYn() == null) bbsMaster.setUseYn("Y");
		if (bbsMaster.getAnsYn() == null) bbsMaster.setAnsYn("N");
		if (bbsMaster.getCmntYn() == null) bbsMaster.setCmntYn("N");
		if (bbsMaster.getSortYn() == null) bbsMaster.setSortYn("N");
		if (bbsMaster.getMainPstgYn() == null) bbsMaster.setMainPstgYn("N");
		if (bbsMaster.getUpendFixYn() == null) bbsMaster.setUpendFixYn("N");
		if (bbsMaster.getThmbYn() == null) bbsMaster.setThmbYn("N");
		if (bbsMaster.getLnkgYn() == null) bbsMaster.setLnkgYn("N");
		if (bbsMaster.getHdnYn() == null) bbsMaster.setHdnYn("N");
		if (bbsMaster.getLckYn() == null) bbsMaster.setLckYn("N");
		if (bbsMaster.getNewYn() == null) bbsMaster.setNewYn("N");
		if (bbsMaster.getNewNmtm() == null) bbsMaster.setNewNmtm(0);
		if (bbsMaster.getPopYn() == null) bbsMaster.setPopYn("N");
		if (bbsMaster.getPopInqCnt() == null) bbsMaster.setPopInqCnt(0);
		if (bbsMaster.getCtgrYn() == null) bbsMaster.setCtgrYn("N");
		if (bbsMaster.getEtc1UseYn() == null) bbsMaster.setEtc1UseYn("N");
		if (bbsMaster.getEtc2UseYn() == null) bbsMaster.setEtc2UseYn("N");
		if (bbsMaster.getEtc3UseYn() == null) bbsMaster.setEtc3UseYn("N");
		if (bbsMaster.getEtc4UseYn() == null) bbsMaster.setEtc4UseYn("N");
		if (bbsMaster.getEtc5UseYn() == null) bbsMaster.setEtc5UseYn("N");
		if (bbsMaster.getListAuthrtCd() == null) bbsMaster.setListAuthrtCd("1");
		if (bbsMaster.getDtlAuthrtCd() == null) bbsMaster.setDtlAuthrtCd("1");
		if (bbsMaster.getWrtAuthrtCd() == null) bbsMaster.setWrtAuthrtCd("3");
	}
}
