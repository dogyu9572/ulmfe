import React from 'react'

type CrudPageCardProps = {
	/** 카드 제목 (card-header에 표시) */
	title: string
	/** 에러 메시지 (있을 때만 표시) */
	error?: string | null
	/** 성공/안내 메시지 (있을 때만 표시) */
	message?: string | null
	children: React.ReactNode
	/**
	 * true면 회색 code-master 래퍼를 쓰지 않음.
	 * 코드관리처럼 code-layout·code-master/code-detail을 이미 쓰는 화면에서 이중 패널·그리드 깨짐 방지.
	 */
	disableInnerPanel?: boolean
}

/**
 * 목록/CRUD 페이지용 기본 카드 레이아웃.
 * - card > card-header(제목) > card-body(에러/메시지 + children)
 * 새 메뉴 추가 시 이 컴포넌트로 본문 영역을 감싸면 관리자관리와 동일한 레이아웃이 적용됩니다.
 */
export const CrudPageCard: React.FC<CrudPageCardProps> = ({
	title,
	error,
	message,
	children,
	disableInnerPanel = false
}) => (
	<div className="card">
		<div className="card-header">
			<h3>{title}</h3>
		</div>
		<div className="card-body">
			{error != null && error !== '' && <p className="form-error">{error}</p>}
			{message != null && message !== '' && <p className="form-success">{message}</p>}
			{disableInnerPanel ? (
				<div className="crud-page-card-inner">{children}</div>
			) : (
				<div className="code-master" style={{ maxWidth: '100%' }}>
					{children}
				</div>
			)}
		</div>
	</div>
)
