// E6 QR 수집 패널 (추가미션) — 카메라로 찍은 사진에서 QR을 읽어 가려진 그림을 한 조각씩 연다
import { useRef, useState } from 'react'
import type { QrPuzzle } from '../../../../state/missionPuzzleTypes'
import { AnswerBox, DemoState } from './puzzleShared'

// 우리가 제작해 납품하는 QR 스티커에 새기는 값 — ULMFE-QR-01 ~ ULMFE-QR-12
const QR_CODE_PREFIX = 'ULMFE-QR-'

type DetectedBarcode = { rawValue: string }

declare global {
	interface Window {
		BarcodeDetector?: new (options?: { formats: string[] }) => { detect: (source: ImageBitmapSource) => Promise<DetectedBarcode[]> }
	}
}

/** 사진 한 장에서 미션 QR 번호를 읽는다. 우리 QR이 아니면 0을 준다 */
const readQrNumber = async (file: File, qrCount: number) => {
	if (!window.BarcodeDetector) throw new Error('이 기기의 브라우저가 QR 인식(BarcodeDetector)을 지원하지 않습니다.')
	const bitmap = await createImageBitmap(file)
	try {
		const detected = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(bitmap)
		for (const { rawValue } of detected) {
			if (!rawValue.startsWith(QR_CODE_PREFIX)) continue
			const number = Number(rawValue.slice(QR_CODE_PREFIX.length))
			if (Number.isInteger(number) && number >= 1 && number <= qrCount) return number
		}
		return 0
	} finally {
		bitmap.close()
	}
}

// 카메라 촬영본을 읽을 수 없는 기기에서는 스티커에 함께 인쇄된 번호를 직접 입력해 진행한다
const supportsDetector = typeof window !== 'undefined' && Boolean(window.BarcodeDetector)

export const QrPuzzlePanel = ({ puzzle, demo, onSubmit }: { puzzle: QrPuzzle; demo?: DemoState; onSubmit: (ok: boolean) => void }) => {
	const [scannedNumbers, setScannedNumbers] = useState<number[]>([])
	const [manualNumber, setManualNumber] = useState('')
	const [message, setMessage] = useState('')
	const fileRef = useRef<HTMLInputElement>(null)
	const scanned = scannedNumbers.length
	const allScanned = scanned >= puzzle.qrCount

	const addScannedNumber = (number: number, suffix = '') => {
		// 같은 QR을 연속으로 인식하면 바깥의 includes 검사가 둘 다 낡은 값을 보므로, 갱신 함수 안에서 한 번 더 막는다
		setScannedNumbers((numbers) => numbers.includes(number) ? numbers : [...numbers, number])
		setMessage(`${number}번 QR을 찾았습니다.${suffix}`)
	}
	const scanPhoto = async (file?: File) => {
		if (!file) return
		try {
			const number = await readQrNumber(file, puzzle.qrCount)
			if (!number) setMessage('사진에서 미션 QR을 찾지 못했습니다. QR이 화면에 꽉 차도록 다시 찍어주세요.')
			else if (scannedNumbers.includes(number)) setMessage(`${number}번 QR은 이미 스캔했습니다.`)
			else addScannedNumber(number)
		} catch (error) {
			// 원인을 화면에서 바로 확인할 수 있도록 브라우저가 준 메시지를 그대로 보여준다
			setMessage(error instanceof Error ? error.message : String(error))
		}
	}
	const submitManualNumber = () => {
		const number = Number(manualNumber)
		if (!Number.isInteger(number) || number < 1 || number > puzzle.qrCount) setMessage(`1부터 ${puzzle.qrCount} 사이의 번호를 입력해주세요.`)
		else if (scannedNumbers.includes(number)) setMessage(`${number}번 QR은 이미 찾았습니다.`)
		else addScannedNumber(number)
		setManualNumber('')
	}
	// 실물 QR 없이 검수할 수 있도록 아직 찾지 않은 번호를 하나씩 채운다
	const scanForDemo = () => {
		const next = Array.from({ length: puzzle.qrCount }, (_, index) => index + 1).find((number) => !scannedNumbers.includes(number))
		if (next) addScannedNumber(next, ' (시연)')
	}

	return (
		<>
			{supportsDetector && (
				<input
					ref={fileRef}
					type="file"
					accept="image/*"
					capture="environment"
					hidden
					onChange={(event) => {
						void scanPhoto(event.target.files?.[0])
						event.target.value = ''
					}}
				/>
			)}
			<div className="mproto_center">
				{supportsDetector
					? <button type="button" className="btn btn_wbb mproto_btn" disabled={allScanned} onClick={() => fileRef.current?.click()}>QR 촬영하기</button>
					: (
						<form className="mproto_qrmanual" onSubmit={(event) => { event.preventDefault(); submitManualNumber() }}>
							<label htmlFor="qrManualNumber">이 기기는 QR 자동 인식을 지원하지 않습니다. 스티커에 적힌 번호를 입력하세요.</label>
							<span>
								<input
									id="qrManualNumber"
									type="number"
									inputMode="numeric"
									min={1}
									max={puzzle.qrCount}
									value={manualNumber}
									disabled={allScanned}
									onChange={(event) => setManualNumber(event.target.value)}
								/>
								<button type="submit" className="btn btn_wbb mproto_btn" disabled={allScanned}>확인</button>
							</span>
						</form>
					)}
				{demo?.proto && <button type="button" className="btn btn_kwg mproto_btn" disabled={allScanned} onClick={scanForDemo}>시연 스캔</button>}
			</div>
			<div className="mproto_qr">
				{Array.from({ length: puzzle.fragmentCount }, (_, index) => (
					<div className={`mproto_frag${scannedNumbers.includes(index + 1) ? ' open' : ''}`} key={index}>{scannedNumbers.includes(index + 1) ? '✓' : index + 1}</div>
				))}
			</div>
			<div className="mproto_center" aria-live="polite">
				찾은 QR <strong>{scanned} / {puzzle.qrCount}</strong>{message && <> &nbsp;·&nbsp; {message}</>}
			</div>
			{allScanned && (
				<div className="mproto_center">
					<button type="button" className="btn btn_wbb mproto_btn" onClick={() => onSubmit(true)}>완료</button>
				</div>
			)}
			<AnswerBox demo={demo}>
				정답 판정이 없는 수집형입니다. <strong>QR 촬영하기</strong>로 <code>{QR_CODE_PREFIX}01</code> ~ <code>{`${QR_CODE_PREFIX}${String(puzzle.qrCount).padStart(2, '0')}`}</code>를 찍으면 해당 번호 조각이 열립니다.
				QR 자동 인식을 지원하지 않는 기기에서는 번호 직접 입력으로 바뀝니다 (현재 기기는 {supportsDetector ? '지원함' : '지원하지 않음'}).
				실물 QR이 없으면 <strong>시연 스캔</strong>으로 대신 진행합니다 (프로토타입 화면 전용).
			</AnswerBox>
		</>
	)
}
