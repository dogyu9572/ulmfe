package egovframework.let.usr.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QnaPasswordRequest {
	@NotBlank(message = "비밀번호를 입력해주세요.")
	@Size(max = 50, message = "비밀번호는 50자 이하로 입력해주세요.")
	private String password;
}
