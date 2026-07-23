package egovframework.let.usr.service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QnaVerifyResponse {
	private String postId;
	private boolean verified;
	private boolean passwordProtected;
}
