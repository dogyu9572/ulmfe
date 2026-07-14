package egovframework.tablet.service.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TabletPushDeviceVO {
	private String deviceId;
	private String fcmToken;
	private String roleCd;
	private Integer rsvtSn;
	private String activeYn;
	private LocalDateTime clientUpdatedAt;
}
