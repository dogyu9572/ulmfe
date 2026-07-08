import { useNavigate } from 'react-router-dom'
import { useRequiredTabletStudentFlowSession } from '../../../hooks/useTabletStudentFlowSession'
import { studentFlowExploreIntroStep, studentFlowExploreThoughtRows, studentFlowExploreVideoRows } from '../../../state/tabletStudentFlowSession'
import { youtubeThumbnailUrls } from '../../../utils/youtube'
import { MissionShell } from './missionShared'

const fallbackVideoImage = '/pub/images/img_start_vission_video.webp'

export const Mission01Page = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const introStep = studentFlowExploreIntroStep(flowSession)
	const videos = studentFlowExploreVideoRows(flowSession)
	const thoughts = studentFlowExploreThoughtRows(flowSession)
	const title = introStep?.title || '도입 영상 시청하기'
	const firstVideo = videos[0]
	const thumbnailUrls = youtubeThumbnailUrls(firstVideo?.videoUrl)
	const thumbnailSrc = thumbnailUrls.primary || fallbackVideoImage
	const thumbnailFallbackSrc = thumbnailUrls.fallback || fallbackVideoImage

	return (
		<MissionShell title={title} step={`STEP 1 ${introStep?.stepName || '스토리 제시'}`} subtitle={title} location={introStep?.place || ''}>
			<div className="page_quest">
				<h2 className="sound_only">영상</h2>
				<ul className="start_video_area">
					{firstVideo ? (
						<li className="w100p">
							<a href={firstVideo.videoUrl || '#'} onClick={(event) => {
								event.preventDefault()
								if (!firstVideo.videoUrl) {
									return
								}
								navigate('/student/quest_video')
							}}>
								<div className="img" aria-hidden="true"><img src={thumbnailSrc} alt="" referrerPolicy="no-referrer" onError={(event) => {
									if (event.currentTarget.src !== thumbnailFallbackSrc) {
										event.currentTarget.src = thumbnailFallbackSrc
										return
									}
									event.currentTarget.src = fallbackVideoImage
								}} /></div>
								<div className="txt">
									<div className="time">{introStep?.limitMin ? `${introStep.limitMin}분` : ''}</div>
									<h3 className="tit">{firstVideo.contentName || '도입 영상'}</h3>
								</div>
							</a>
						</li>
					) : <li className="w100p"><div className="txt"><h3 className="tit">관리자에 등록된 영상이 없습니다.</h3></div></li>}
				</ul>
				<div className="stit icon_think">생각해봐요!</div>
				<ul className="think_list">
					{thoughts.length > 0 ? thoughts.map((thought) => <li key={thought}><span>{thought}</span><i aria-hidden="true"></i></li>) : <li><span>관리자에 등록된 생각해보기 문항이 없습니다.</span><i aria-hidden="true"></i></li>}
				</ul>
				<a href="/student/mission02" className="btn btn_wbb flex_center btn_next_page mt" onClick={(event) => {
					event.preventDefault()
					navigate('/student/mission02')
				}}>다음 미션으로 이동하기</a>
			</div>
		</MissionShell>
	)
}
