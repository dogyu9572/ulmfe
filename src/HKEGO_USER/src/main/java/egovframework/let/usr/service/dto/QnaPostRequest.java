package egovframework.let.usr.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QnaPostRequest {
	@NotBlank(message = "제목을 입력해주세요.")
	@Size(max = 500, message = "제목은 500자 이하로 입력해주세요.")
	private String title;

	@NotBlank(message = "작성자를 입력해주세요.")
	@Size(max = 100, message = "작성자는 100자 이하로 입력해주세요.")
	private String writerName;

	@NotBlank(message = "비밀번호를 입력해주세요.")
	@Size(min = 10, max = 50, message = "비밀번호는 10자 이상 50자 이하로 입력해주세요.")
	private String password;

	@NotBlank(message = "내용을 입력해주세요.")
	private String content;

	@NotBlank(message = "자동등록방지 코드를 입력해주세요.")
	@Size(max = 6, message = "자동등록방지 코드는 6자 이하로 입력해주세요.")
	private String captcha;
}
