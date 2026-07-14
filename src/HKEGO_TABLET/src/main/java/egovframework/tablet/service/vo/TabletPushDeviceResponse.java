package egovframework.tablet.service.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TabletPushDeviceResponse {
	private boolean success;
	private String deviceId;
	private String serverUpdatedAt;
}
