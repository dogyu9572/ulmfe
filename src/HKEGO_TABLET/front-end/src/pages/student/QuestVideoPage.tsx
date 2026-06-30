import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const videoSrc = '/pub/video/video_sample.mp4'
const storageKey = `video_progress_${videoSrc}`

const formatTime = (second: number) => {
	if (!Number.isFinite(second)) return '00:00'
	const minutes = Math.floor(second / 60)
	const seconds = Math.floor(second % 60)
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const QuestVideoPage = () => {
	const navigate = useNavigate()
	const videoRef = useRef<HTMLVideoElement>(null)
	const [playing, setPlaying] = useState(false)
	const [muted, setMuted] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(1)

	useEffect(() => {
		const video = videoRef.current
		const saved = sessionStorage.getItem(storageKey)
		if (!video || !saved) return
		const restore = () => {
			video.currentTime = parseFloat(saved) || 0
			setCurrentTime(video.currentTime)
		}
		video.addEventListener('loadedmetadata', restore, { once: true })
		return () => video.removeEventListener('loadedmetadata', restore)
	}, [])

	const togglePlay = () => {
		const video = videoRef.current
		if (!video) return
		if (video.paused) video.play()
		else video.pause()
	}

	const stopVideo = () => {
		const video = videoRef.current
		if (!video) return
		video.pause()
		video.currentTime = 0
		setCurrentTime(0)
	}

	const seekPercent = duration ? (currentTime / duration) * 100 : 0

	return (
		<main className="container flex_center" id="mainContent">
			<h1 className="sound_only">도입 영상 시청하기</h1>

			<section className="video_page custom_video_wrap">
				<video id="mainVideo" playsInline ref={videoRef} onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => { setPlaying(false); sessionStorage.removeItem(storageKey) }}>
					<source src={videoSrc} type="video/mp4" />
				</video>

				<div className="video_controls">
					<div className="seek_wrap">
						<div className="seek_track">
							<div className="seek_fill" id="seekFill" style={{ width: `${seekPercent}%` }}></div>
						</div>
						<input type="range" id="seekBar" className="seek_bar" min="0" max="100" value={seekPercent} step="0.1" onChange={(event) => {
							const video = videoRef.current
							if (!video || !duration) return
							video.currentTime = (Number(event.target.value) / 100) * duration
						}} />
					</div>

					<div className="control_row">
						<button type="button" id="playBtn" className={`btn_play${playing ? ' on' : ''}`} aria-label={playing ? '일시정지' : '재생'} onClick={togglePlay}></button>
						<button type="button" id="stopBtn" className="btn_stop" aria-label="정지" onClick={stopVideo}></button>
						<span id="timeLabel" className="time_label">{formatTime(currentTime)} / {formatTime(duration)}</span>
						<button type="button" id="muteBtn" className={`btn_mute${muted ? ' on' : ''}`} aria-label="음소거" onClick={() => {
							const video = videoRef.current
							if (!video) return
							video.muted = !video.muted
							setMuted(video.muted)
							if (video.muted) setVolume(0)
							else setVolume(video.volume || 1)
						}}></button>
						<div className="volume_wrap">
							<div className="volume_track">
								<div className="volume_fill" id="volumeFill" style={{ width: `${volume * 100}%` }}></div>
							</div>
							<input type="range" id="volumeBar" className="volume_bar" min="0" max="1" value={volume} step="0.01" onChange={(event) => {
								const video = videoRef.current
								if (!video) return
								const nextVolume = Number(event.target.value)
								video.volume = nextVolume
								video.muted = nextVolume === 0
								setVolume(nextVolume)
								setMuted(video.muted)
							}} />
						</div>
						<button type="button" id="exitBtn" className="btn_exit_fullscreen" aria-label="이전 화면으로" onClick={() => {
							const video = videoRef.current
							if (video) sessionStorage.setItem(storageKey, String(video.currentTime))
							navigate(-1)
						}}></button>
					</div>
				</div>
			</section>
		</main>
	)
}
