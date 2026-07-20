type StudentProgramCompletionPopupProps = {
	open: boolean
	variant: 'explore' | 'mission'
	displayName: string
	missionAreaCount?: number
	onClose: () => void
	onComplete: () => void
}

export const StudentProgramCompletionPopup = ({
	open,
	variant,
	displayName,
	missionAreaCount = 0,
	onClose,
	onComplete
}: StudentProgramCompletionPopupProps) => {
	const mission = variant === 'mission'
	const missionAreaText = missionAreaCount > 0 ? `${missionAreaCount}개 구역` : '모든 구역'

	return (
		<div className={`popup pop_completed${open ? ' is-active' : ''}`}>
			<div className="dm" onClick={onClose}></div>
			<div className="inbox">
				<button type="button" className="btn_close" onClick={onClose}>닫기</button>
				<div className="tit">{mission ? '미션 수행 완료!' : '사건탐구 완료!'}</div>
				<div className="con scroll_wrap">
					<div className="scroll">
						<div className="flex_center">
							<div className="imgbox">
								<img src={mission ? '/pub/images/img_hero_completed.webp' : '/pub/images/img_sample_completed.webp'} alt="" />
								{mission && <p>울산 SDGs 히어로즈</p>}
							</div>
						</div>
						<div className="txt">
							{mission ? (
								<><div className="tt">{displayName}님은 이제 <strong>'울산 SDGs 히어로즈'</strong>입니다!</div><p>{missionAreaText}을 모두 돌며 지속가능한 소비의 의미를 탐구했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p></>
							) : (
								<><div className="tt">{displayName} 학생은 이제 멋진 <strong>'미래 마을 디자이너'</strong>입니다!</div><p>4개 구역을 모두 돌며 살기 좋은 도시의 조건을 탐색하고,<br />우리가 꿈꾸는 미래 울산의 모습을 멋지게 완성했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p></>
							)}
						</div>
						<div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={onComplete}>{mission ? '미션 완료 하기' : '교육 완료 하기'}</button></div>
						<p className="tac p_end">세션 종료 시, 키오스크 화면으로 이동합니다.</p>
					</div>
				</div>
			</div>
		</div>
	)
}
