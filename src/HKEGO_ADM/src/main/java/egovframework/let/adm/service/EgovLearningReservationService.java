package egovframework.let.adm.service;

import egovframework.let.adm.service.vo.LearningReservationDto;
import egovframework.let.adm.service.vo.LearningReservationVO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface EgovLearningReservationService {
	Map<String, Object> getLearningReservationListPage(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword,
		int page,
		int size
	);

	List<LearningReservationVO> getLearningReservationExcelRows(
		String lrnSttsCd,
		String prgrmTypeCd,
		String startRsvtYmd,
		String endRsvtYmd,
		String searchType,
		String searchKeyword
	);

	LearningReservationVO getLearningReservationById(Integer rsvtSn);

	LearningReservationVO createLearningReservation(LearningReservationDto dto);

	LearningReservationVO updateLearningReservation(Integer rsvtSn, LearningReservationDto dto);

	int importReservations(MultipartFile file) throws IOException;

	LearningReservationVO importStudents(Integer rsvtSn, MultipartFile file) throws IOException;

	void deleteLearningReservation(Integer rsvtSn);
}
