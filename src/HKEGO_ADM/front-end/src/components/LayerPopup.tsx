import React from 'react'

type LayerPopupProps = {
	/** 팝업 표시 여부 */
	open: boolean
	/** 팝업 헤더 제목 */
	title: string
	/** 닫기 콜백 (백드롭/닫기 버튼) */
	onClose: () => void
	/** 본문 내용 */
	children: React.ReactNode
	/** 푸터 영역 (버튼 등). 없으면 닫기 버튼만 표시 */
	footer?: React.ReactNode
	/** 팝업 폭 확장 (상세 코드 등 필드 많은 폼용) */
	wide?: boolean
	/** 4열 테이블 등 폭 2배 (wide + 2x max-width) */
	wideDouble?: boolean
	/** 기본 대비 +300px 확장 */
	widePlus300?: boolean
	/** aria-label for close button */
	closeAriaLabel?: string
}

/**
 * 레이어 팝업 공통 컴포넌트.
 * - 백드롭 클릭 / 헤더 닫기 버튼으로 onClose 호출
 * - body는 form-table 등으로 2열 폼 구성 권장
 */
export const LayerPopup: React.FC<LayerPopupProps> = ({
	open,
	title,
	onClose,
	children,
	footer,
	wide = false,
	wideDouble = false,
	widePlus300 = false,
	closeAriaLabel = '닫기'
}) => {
	if (!open) return null
	const wideClass = wideDouble
		? 'layer-popup-wide layer-popup-wide-2x'
		: (widePlus300 ? 'layer-popup-wide-plus300' : (wide ? 'layer-popup-wide' : ''))
	return (
		<>
			<div className="layer-backdrop" onClick={onClose} aria-hidden />
			<div
				className={`layer-popup ${wideClass}`}
				role="dialog"
				aria-modal="true"
			>
				<div className="layer-popup-header">
					<h4>{title}</h4>
					<button
						type="button"
						className="layer-close"
						onClick={onClose}
						aria-label={closeAriaLabel}
					>
						×
					</button>
				</div>
				<div className="layer-popup-body">{children}</div>
				<div className="layer-popup-footer">
					{footer != null ? footer : (
						<button type="button" onClick={onClose}>닫기</button>
					)}
				</div>
			</div>
		</>
	)
}
