export const TeacherCallPopup = () => (
	<div className="popup pop_teacher_call" id="pop_teacher_call">
		<div className="dm"></div>
		<div className="inbox">
			<button type="button" className="btn_close">닫기</button>
			<div className="tit">선생님 호출</div>
			<div className="con scroll_wrap">
				<div className="scroll">
					<div className="tt">선생님을 호출하시겠습니까?</div>
					<p>호출하면 선생님께 알림이 전송됩니다.</p>
					<div className="btns_btm">
						<button type="button" className="btn btn_kwg btn_clo">이전</button>
						<button type="button" className="btn btn_wbb">호출</button>
					</div>
				</div>
			</div>
		</div>
	</div>
)

export const TeacherMessagePopup = () => (
	<div className="popup pop_teacher_maseage" id="pop_teacher_maseage">
		<div className="dm"></div>
		<div className="inbox">
			<button type="button" className="btn_close">닫기</button>
			<div className="tit">선생님 메시지</div>
			<div className="con scroll_wrap">
				<div className="scroll">
					<div className="textarea">
						<textarea name="" id="" cols={30} rows={10} className="text w100p" placeholder="다음 존으로 이동해주세요. 5분 남았습니다!"></textarea>
					</div>
					<div className="btns_btm">
						<button type="button" className="btn btn_wbb">확인했어요</button>
					</div>
				</div>
			</div>
		</div>
	</div>
)

export const StudentPopups = () => (
	<>
		<TeacherCallPopup />
		<TeacherMessagePopup />
	</>
)
