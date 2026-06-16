import React from 'react'

type RowActionButtonsProps = {
	/** 수정 클릭 시 호출 */
	onEdit: () => void
	/** 삭제 클릭 시 호출 (확인은 각 페이지에서 처리) */
	onDelete: () => void
	/** 로딩 중일 때 삭제 버튼 비활성화 */
	disabled?: boolean
	/** 추가 버튼 (예: 권한관리). { label, onClick }[] */
	extra?: Array<{ label: string; onClick: () => void; className?: string }>
	editLabel?: string
}

/**
 * 목록 테이블의 "관리" 열에 공통으로 사용하는 수정/삭제 버튼.
 * td에는 display:flex를 두지 않도록, 내부 래퍼에서 정렬합니다.
 * 부모 td: className="table-actions admin-list-manage-td" 및 onClick={(e) => e.stopPropagation()}
 */
export const RowActionButtons: React.FC<RowActionButtonsProps> = ({
	onEdit,
	onDelete,
	disabled = false,
	extra = [],
	editLabel = '수정'
}) => (
	<div className="row-actions-cell-inner">
		<button type="button" className="admin-list-btn-edit" onClick={onEdit}>
			{editLabel}
		</button>
		<button
			type="button"
			className="admin-footer-btn-delete"
			onClick={onDelete}
			disabled={disabled}
		>
			삭제
		</button>
		{extra.map((btn) => (
			<button
				key={btn.label}
				type="button"
				className={btn.className ?? 'admin-list-btn-sky'}
				onClick={btn.onClick}
			>
				{btn.label}
			</button>
		))}
	</div>
)
