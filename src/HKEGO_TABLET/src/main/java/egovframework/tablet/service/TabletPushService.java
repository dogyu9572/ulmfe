package egovframework.tablet.service;

import egovframework.tablet.service.vo.TabletPushDeviceRequest;
import egovframework.tablet.service.vo.TabletPushDeviceResponse;
import egovframework.tablet.service.vo.TabletTeacherCallVO;
import egovframework.tablet.service.vo.TabletTeacherMessageVO;

import java.util.List;

public interface TabletPushService {
	TabletPushDeviceResponse registerDevice(String deviceId, TabletPushDeviceRequest request);

	void sendTeacherCallAfterCommit(TabletTeacherCallVO teacherCall);

	void sendTeacherMessageAfterCommit(TabletTeacherMessageVO teacherMessage, List<Integer> studentSns);
}
