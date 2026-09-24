import { pubUrl } from '../../config'
type StudentProgramCompletionPopupProps = {
	open: boolean
	variant: 'explore' | 'mission'
	displayName: string
	programName?: string
	areaCount?: number
	onClose: () => void
	onComplete: () => void
}

export const StudentProgramCompletionPopup = ({
	open,
	variant,
	displayName,
	programName = '',
	areaCount = 0,
	onClose,
	onComplete
}: StudentProgramCompletionPopupProps) => {
	const mission = variant === 'mission'
	const areaText = areaCount > 0 ? `${areaCount}개 구역` : '모든 구역'
	// 완료 문구는 예약에 연결된 프로그램명을 따른다. 특정 프로그램 문구를 박아 두면
	// 다른 프로그램을 마쳐도 엉뚱한 내용이 나온다.
	const programText = programName.trim() || '오늘의 활동'

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
								<img src={mission ? pubUrl('/pub/images/img_hero_completed.webp') : pubUrl('/pub/images/img_sample_completed.webp')} alt="" />
								{mission && <p>울산 SDGs 히어로즈</p>}
							</div>
						</div>
						<div className="txt">
							{mission ? (
								<><div className="tt">{displayName}님은 이제 <strong>'울산 SDGs 히어로즈'</strong>입니다!</div><p>{areaText}을 모두 돌며 지속가능한 소비의 의미를 탐구했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p></>
							) : (
								<><div className="tt">{displayName} 학생, <strong>{programText}</strong> 활동을 모두 마쳤어요!</div><p>{areaText}을 모두 돌며 사건의 단서를 찾아 해결했어요.<br />세션을 종료하고 태블릿을 반납해주세요.</p></>
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
