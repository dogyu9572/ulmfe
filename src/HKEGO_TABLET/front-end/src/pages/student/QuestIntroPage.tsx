import { useNavigate } from 'react-router-dom'
import { StudentCaseHeader } from '../../components/tablet/StudentCaseHeader'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'
import { studentFlowExploreIntroStep, studentFlowExploreThoughtRows, studentFlowExploreVideoRows } from '../../state/tabletStudentFlowSession'
import { videoThumbnailUrls } from '../../utils/youtube'

const fallbackVideoImages = ['/pub/images/img_start_video01.webp', '/pub/images/img_start_video02.webp', '/pub/images/img_start_video03.webp']

export const QuestIntroPage = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	if (!flowSession) return null

	const introStep = studentFlowExploreIntroStep(flowSession)
	const videos = studentFlowExploreVideoRows(flowSession)
	const thoughts = studentFlowExploreThoughtRows(flowSession)
	const firstQuestPath = '/student/quest01'
	const videoClasses = ['c1', 'c2', 'c3']

	return (
		<main className="container" id="mainContent">
			<h1 className="sound_only">도입 영상 시청하기</h1>
			<StudentCaseHeader />

			<section className="basic_board">
				<div className="student_title">
					<div className="step">STEP 1 사건제시</div>
					<div className="subtitle"><strong>{introStep?.title || '도입 영상 시청하기'}</strong></div>
					<div className="location">{introStep?.place || ''}</div>
				</div>

				<div className="page_quest">
					<h2 className="sound_only">영상 목록</h2>
					<ul className="start_video_area">
						{videos.length > 0 ? videos.slice(0, 3).map((video, index) => {
							const fallbackImage = fallbackVideoImages[index] || fallbackVideoImages[0]
							const thumbnailUrls = videoThumbnailUrls(video.videoUrl)
							const thumbnailSrc = thumbnailUrls.primary || fallbackImage
							const thumbnailFallbackSrc = thumbnailUrls.fallback || fallbackImage
							return (
								<li className={videoClasses[index] || `c${index + 1}`} key={`${video.contentName}-${index}`}>
									<a href={video.videoUrl || '/student/quest_video'} onClick={(event) => {
										if (!video.videoUrl || video.videoUrl.startsWith('/')) {
											event.preventDefault()
											navigate(video.videoUrl || '/student/quest_video')
										}
									}}>
										<div className="type">{video.cardCategory || video.contentType || `영상 ${index + 1}`}</div>
										<div className="img" aria-hidden="true"><img src={thumbnailSrc} alt="" referrerPolicy="no-referrer" onError={(event) => {
											if (event.currentTarget.src !== thumbnailFallbackSrc) {
												event.currentTarget.src = thumbnailFallbackSrc
												return
											}
											event.currentTarget.src = fallbackImage
										}} /></div>
										<div className="txt">
											<div className="time">{introStep?.limitMin ? `${introStep.limitMin}분` : ''}</div>
											<h3 className="tit">{video.contentName || `영상 ${index + 1}`}</h3>
											<div className="line_area">
												<div className="pct"><strong>0</strong>%</div>
												<div className="bar" style={{ width: '0%' }}><div className="pct" aria-hidden="true"><strong>0</strong>%</div></div>
											</div>
										</div>
									</a>
								</li>
							)
						}) : <li className="c1"><div className="txt"><h3 className="tit">관리자에 등록된 영상이 없습니다.</h3></div></li>}
					</ul>

					<div className="stit icon_think">생각해봐요!</div>
					<ul className="think_list">
						{thoughts.length > 0 ? thoughts.map((thought) => <li key={thought}><span>{thought}</span><i aria-hidden="true"></i></li>) : <li><span>관리자에 등록된 생각해보기 문항이 없습니다.</span><i aria-hidden="true"></i></li>}
					</ul>

					<div className="video_check">
						<p>영상을 모두 시청하면 다음 순서로 이동할 수 있어요!</p>
						<ul>
							{videos.slice(0, 3).map((video, index) => <li key={`${video.contentName || 'video'}-${index}`}>{index + 1}번째 영상</li>)}
						</ul>
					</div>
					<a href={firstQuestPath} className="btn btn_wbb flex_center btn_next_page" onClick={(event) => {
						event.preventDefault()
						navigate(firstQuestPath)
					}}>사건 탐구 시작하기</a>
				</div>
			</section>
		</main>
	)
}
