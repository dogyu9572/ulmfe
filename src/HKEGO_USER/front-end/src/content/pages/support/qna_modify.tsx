export default function SupportQnaModifyContent() {
	return (
		<>
			<section className="board_wrap inner" aria-labelledby="page-title">
				<h1 id="page-title" className="subtitle">
					{"1:1문의 작성"}
				</h1>
				<div className="board_write">
					<table>
						<colgroup>
							<col className="w1" />
							<col width="*" />
						</colgroup>
						<tr>
							<th scope="row">
								<label htmlFor="inputTitle">
									{"제목"}
									<span className="c_blue">
										{"*"}
									</span>
								</label>
							</th>
							<td>
								<input type="text" id="inputTitle" className="text w100p" placeholder="제목을 입력해주세요." defaultValue="제목" />
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="inputWriter">
									{"작성자"}
									<span className="c_blue">
										{"*"}
									</span>
								</label>
							</th>
							<td>
								<input type="text" id="inputWriter" className="text w100p" placeholder="작성자를 입력해주세요." defaultValue="고길동" disabled />
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="inputPassword">
									{"비밀번호"}
									<span className="c_blue">
										{"*"}
									</span>
								</label>
							</th>
							<td>
								<input type="password" id="inputPassword" className="text w100p" placeholder="영문, 숫자, 특수문자 2종류 이상을 조합하여 10자리 이상 입력해주세요. (특수문자 가능 기호  ! @ # $ % ^ & *)" />
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="inputContent">
									{"내용"}
									<span className="c_blue">
										{"*"}
									</span>
								</label>
							</th>
							<td>
								<textarea name="" id="inputContent" cols={30} rows={10} className="text w100p" placeholder="내용을 입력해주세요." defaultValue="내용"></textarea>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="captchaArea">
									{"자동등록방지"}
									<span className="c_blue">
										{"*"}
									</span>
								</label>
							</th>
							<td>
								<div className="captcha_area">
									<div className="obj_area">
										<div className="obj imgfit">
											<img src="/pub/images/img_sample_captcha.webp" data-src="" data-captcha-image="" alt="자동등록방지 코드" />
										</div>
										<button type="button" className="obj btn_re" data-captcha-refresh="" aria-label="숫자 이미지 변경"></button>
									</div>
									<input type="text" name="captcha" id="captchaArea" className="obj text" maxLength={6} autoComplete="off" />
								</div>
							</td>
						</tr>
					</table>
				</div>
				<div className="board_bottom">
					<div className="flex_center btns">
						<button type="submit" id="btn_submit" className="btn btn_wbb btn_large">
							{"등록"}
						</button>
					</div>
				</div>
			</section>
		</>
	)
}
