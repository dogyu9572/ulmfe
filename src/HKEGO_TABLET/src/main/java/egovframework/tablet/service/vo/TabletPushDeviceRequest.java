package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.List;

@Data
public class TabletPushDeviceRequest {
	private String deviceId;
	private String fcmToken;
	private String role;
	private Integer rsvtSn;
	private List<Integer> studentSns;
	private boolean active;
	private Long clientUpdatedAtEpochMs;
}
