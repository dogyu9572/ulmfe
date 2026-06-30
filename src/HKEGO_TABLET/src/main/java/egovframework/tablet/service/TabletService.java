package egovframework.tablet.service;

import egovframework.tablet.service.vo.TabletLoginRequest;
import egovframework.tablet.service.vo.TabletLoginResponse;
import egovframework.tablet.service.vo.TabletSessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.List;

public interface TabletService {
	TabletLoginResponse login(TabletLoginRequest request, HttpServletRequest httpRequest);

	TabletLoginResponse getLoginSession(HttpSession session);

	TabletSessionResponse getTodaySession(String rsvtYmd);

	void markAttendance(Integer rsvtSn, List<Integer> studentSns);
}
