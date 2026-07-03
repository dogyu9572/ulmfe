import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentFlowExploreVideoRows } from '../../state/tabletStudentFlowSession'
import { useRequiredTabletStudentFlowSession } from '../../hooks/useTabletStudentFlowSession'

const formatTime = (second: number) => {
	if (!Number.isFinite(second)) return '00:00'
	const minutes = Math.floor(second / 60)
	const seconds = Math.floor(second % 60)
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const isLocalVideo = (url: string) => url.startsWith('/') || /\.(mp4|webm|ogg)(?:\?|$)/i.test(url)

export const QuestVideoPage = () => {
	const navigate = useNavigate()
	const flowSession = useRequiredTabletStudentFlowSession()
	const videoRef = useRef<HTMLVideoElement>(null)
	const [playing, setPlaying] = useState(false)
	const [muted, setMuted] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(1)

	const video = flowSession ? studentFlowExploreVideoRows(flowSession)[0] : undefined
	const videoSrc = video?.videoUrl || ''
	const storageKey = flowSession ? `video_progress_${flowSession.rsvtSn}_${videoSrc}` : ''

	useEffect(() => {
		if (!storageKey) return
		const currentVideo = videoRef.current
		const saved = sessionStorage.getItem(storageKey)
		if (!currentVideo || !saved) return
		const restore = () => {
			currentVideo.currentTime = parseFloat(saved) || 0
			setCurrentTime(currentVideo.currentTime)
		}
		currentVideo.addEventListener('loadedmetadata', restore, { once: true })
		return () => currentVideo.removeEventListener('loadedmetadata', restore)
	}, [storageKey])

	if (!flowSession) return null

	const togglePlay = () => {
		const currentVideo = videoRef.current
		if (!currentVideo) return
		if (currentVideo.paused) currentVideo.play()
		else currentVideo.pause()
	}

	const stopVideo = () => {
		const currentVideo = videoRef.current
		if (!currentVideo) return
		currentVideo.pause()
		currentVideo.currentTime = 0
		setCurrentTime(0)
	}

	if (!videoSrc) {
		return (
			<main className="container flex_center" id="mainContent">
				<h1 className="sound_only">도입 영상 시청하기</h1>
				<section className="video_page custom_video_wrap flex_center">
					<div className="wbox a_card_box"><h3 className="tit">관리자에 등록된 영상이 없습니다.</h3><div className="btns_btm"><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/quest01')}>다음</button></div></div>
				</section>
			</main>
		)
	}

	if (!isLocalVideo(videoSrc)) {
		return (
			<main className="container flex_center" id="mainContent">
				<h1 className="sound_only">도입 영상 시청하기</h1>
				<section className="video_page custom_video_wrap flex_center">
					<div className="wbox a_card_box">
						<h3 className="tit">{video?.contentName || '도입 영상'}</h3>
						<p>외부 영상 링크가 등록되어 있습니다.</p>
						<div className="btns_btm"><button type="button" className="btn btn_kwg" onClick={() => window.open(videoSrc, '_blank', 'noopener,noreferrer')}>영상 열기</button><button type="button" className="btn btn_wbb" onClick={() => navigate('/student/quest01')}>다음</button></div>
					</div>
				</section>
			</main>
		)
	}

	const seekPercent = duration ? (currentTime / duration) * 100 : 0

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">{video?.contentName || '도입 영상 시청하기'}</h1>

			<section className="video_page custom_video_wrap">
				<video id="mainVideo" playsInline ref={videoRef} onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => { setPlaying(false); sessionStorage.removeItem(storageKey) }}>
					<source src={videoSrc} />
				</video>

				<div className="video_controls">
					<div className="seek_wrap">
						<div className="seek_track"><div className="seek_fill" id="seekFill" style={{ width: `${seekPercent}%` }}></div></div>
						<input type="range" id="seekBar" className="seek_bar" min="0" max="100" value={seekPercent} step="0.1" onChange={(event) => {
							const currentVideo = videoRef.current
							if (!currentVideo || !duration) return
							currentVideo.currentTime = (Number(event.target.value) / 100) * duration
						}} />
					</div>

					<div className="control_row">
						<button type="button" id="playBtn" className={`btn_play${playing ? ' on' : ''}`} aria-label={playing ? '일시정지' : '재생'} onClick={togglePlay}></button>
						<button type="button" id="stopBtn" className="btn_stop" aria-label="정지" onClick={stopVideo}></button>
						<span id="timeLabel" className="time_label">{formatTime(currentTime)} / {formatTime(duration)}</span>
						<button type="button" id="muteBtn" className={`btn_mute${muted ? ' on' : ''}`} aria-label="음소거" onClick={() => {
							const currentVideo = videoRef.current
							if (!currentVideo) return
							currentVideo.muted = !currentVideo.muted
							setMuted(currentVideo.muted)
							if (currentVideo.muted) setVolume(0)
							else setVolume(currentVideo.volume || 1)
						}}></button>
						<div className="volume_wrap">
							<div className="volume_track"><div className="volume_fill" id="volumeFill" style={{ width: `${volume * 100}%` }}></div></div>
							<input type="range" id="volumeBar" className="volume_bar" min="0" max="1" value={volume} step="0.01" onChange={(event) => {
								const currentVideo = videoRef.current
								if (!currentVideo) return
								const nextVolume = Number(event.target.value)
								currentVideo.volume = nextVolume
								currentVideo.muted = nextVolume === 0
								setVolume(nextVolume)
								setMuted(currentVideo.muted)
							}} />
						</div>
						<button type="button" id="exitBtn" className="btn_exit_fullscreen" aria-label="다음 화면으로" onClick={() => {
							const currentVideo = videoRef.current
							if (currentVideo) sessionStorage.setItem(storageKey, String(currentVideo.currentTime))
							navigate('/student/quest01')
						}}></button>
					</div>
				</div>
			</section>
		</main>
	)
}
