import React, { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'
import { ListPagination } from '../components/ListPagination'
import { formatListToolbarInfo } from '../utils/listToolbarInfo'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

function todayIso(): string {
	return new Date().toISOString().slice(0, 10)
}

function firstDayOfMonthIso(): string {
	const d = new Date()
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function lastDayOfMonthIso(): string {
	const d = new Date()
	return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
}

type ToolbarProps = {
	pageSize: number
	onPageSizeChange: (value: number) => void
	showPageSize?: boolean
}

const EmptyRow: React.FC<{ colSpan: number }> = ({ colSpan }) => (
	<tr>
		<td colSpan={colSpan} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
	</tr>
)

const StatsToolbar: React.FC<ToolbarProps> = ({ pageSize, onPageSizeChange, showPageSize = true }) => (
	<div className="list-toolbar">
		<div className="list-toolbar-left">
			<span className="list-toolbar-info">{formatListToolbarInfo(0, 1, 1)}</span>
			{showPageSize ? (
				<select
					value={pageSize}
					onChange={(e) => onPageSizeChange(Number(e.target.value))}
					className="list-page-size-select"
					aria-label="페이지당 목록 개수"
				>
					{PAGE_SIZE_OPTIONS.map((option) => (
						<option key={option} value={option}>{option}</option>
					))}
				</select>
			) : null}
		</div>
		<div className="list-toolbar-actions">
			<button type="button" className="admin-filter-btn-reset" disabled>엑셀파일 다운로드</button>
		</div>
	</div>
)

export const NotificationSendLogPage: React.FC = () => {
	const [pageSize, setPageSize] = useState(20)
	const [target, setTarget] = useState('')
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(todayIso)
	const [searchType, setSearchType] = useState('all')
	const [keyword, setKeyword] = useState('')

	const reset = () => {
		setTarget('')
		setStartDate(firstDayOfMonthIso())
		setEndDate(todayIso())
		setSearchType('all')
		setKeyword('')
	}

	return (
		<AdminLayout title="알림 발송 로그">
			<CrudPageCard title="알림 발송 로그">
				<StatsToolbar pageSize={pageSize} onPageSizeChange={setPageSize} />

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">발송 대상</label>
						<select className="bbs-post-filter-select" value={target} onChange={(e) => setTarget(e.target.value)}>
							<option value="">전체</option>
							<option value="TEACHER_TO_STUDENT">선생님 -&gt; 학생</option>
							<option value="STUDENT_TO_TEACHER">학생 -&gt; 선생님</option>
						</select>
						<label className="bbs-post-filter-label">발송일</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select className="bbs-post-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="school">발송 학교</option>
							<option value="content">내용</option>
						</select>
						<input type="text" className="bbs-post-filter-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색어" />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky">검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 80 }}>번호</th>
							<th style={{ width: 160 }}>발송일시</th>
							<th style={{ width: 160 }}>발송 학교</th>
							<th style={{ width: 150 }}>발송 대상</th>
							<th>내용</th>
							<th style={{ width: 110 }}>발송 성공</th>
						</tr>
					</thead>
					<tbody>
						<EmptyRow colSpan={6} />
					</tbody>
				</table>
				<ListPagination page={1} totalPages={1} onPageChange={() => undefined} />
			</CrudPageCard>
		</AdminLayout>
	)
}

export const VisitCountStatsPage: React.FC = () => {
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(lastDayOfMonthIso)

	const reset = () => {
		setStartDate(firstDayOfMonthIso())
		setEndDate(lastDayOfMonthIso())
	}

	return (
		<AdminLayout title="방문 인원 통계">
			<CrudPageCard title="방문 인원 통계">
				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">기간조회</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky">검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<div className="list-toolbar">
					<div className="list-toolbar-left" />
					<div className="list-toolbar-actions">
						<button type="button" className="admin-filter-btn-reset" disabled>엑셀파일 다운로드</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th>프로그램 구분</th>
							<th>예약 학교 수(명)</th>
							<th>방문 학교 수(명)</th>
							<th>예약 학생 수(명)</th>
							<th>출석완료 학생 수(명)</th>
						</tr>
					</thead>
					<tbody>
						<EmptyRow colSpan={5} />
					</tbody>
				</table>

				<h3 className="visitor-stats-panel-title" style={{ marginTop: 24 }}>학교별 집계</h3>
				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 80 }}>순위</th>
							<th>학교명</th>
							<th style={{ width: 140 }}>학년/반</th>
							<th style={{ width: 120 }}>방문횟수</th>
							<th style={{ width: 160 }}>총 방문 학생 수</th>
							<th style={{ width: 160 }}>출석완료 학생 수</th>
							<th style={{ width: 140 }}>마지막 방문</th>
						</tr>
					</thead>
					<tbody>
						<EmptyRow colSpan={7} />
					</tbody>
				</table>
			</CrudPageCard>
		</AdminLayout>
	)
}

export const EducationProgramStatsPage: React.FC = () => {
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(lastDayOfMonthIso)

	const reset = () => {
		setStartDate(firstDayOfMonthIso())
		setEndDate(lastDayOfMonthIso())
	}

	return (
		<AdminLayout title="교육프로그램 통계">
			<CrudPageCard title="교육프로그램 통계">
				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">기간조회</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky">검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<div className="list-toolbar">
					<div className="list-toolbar-left" />
					<div className="list-toolbar-actions">
						<button type="button" className="admin-filter-btn-reset" disabled>엑셀파일 다운로드</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 140 }}>프로그램 구분</th>
							<th>프로그램명</th>
							<th style={{ width: 120 }}>STEP1 완료율</th>
							<th style={{ width: 120 }}>STEP2 완료율</th>
							<th style={{ width: 120 }}>STEP3 완료율</th>
							<th style={{ width: 120 }}>STEP4 완료율</th>
						</tr>
					</thead>
					<tbody>
						<EmptyRow colSpan={6} />
					</tbody>
				</table>
			</CrudPageCard>
		</AdminLayout>
	)
}

export const MaterialDownloadStatsPage: React.FC = () => {
	const [pageSize, setPageSize] = useState(20)
	const [lrnType, setLrnType] = useState('')
	const [dataType, setDataType] = useState('')
	const [startDate, setStartDate] = useState(firstDayOfMonthIso)
	const [endDate, setEndDate] = useState(todayIso)
	const [searchType, setSearchType] = useState('all')
	const [keyword, setKeyword] = useState('')

	const reset = () => {
		setLrnType('')
		setDataType('')
		setStartDate(firstDayOfMonthIso())
		setEndDate(todayIso())
		setSearchType('all')
		setKeyword('')
	}

	return (
		<AdminLayout title="자료실 다운로드 통계">
			<CrudPageCard title="자료실 다운로드 통계">
				<StatsToolbar pageSize={pageSize} onPageSizeChange={setPageSize} />

				<div className="bbs-post-filters search-section">
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">학습유형</label>
						<select className="bbs-post-filter-select" value={lrnType} onChange={(e) => setLrnType(e.target.value)}>
							<option value="">전체</option>
							<option value="PRE">사전학습</option>
							<option value="MAIN">본학습</option>
							<option value="POST">사후학습</option>
						</select>
						<label className="bbs-post-filter-label">자료구분</label>
						<select className="bbs-post-filter-select" value={dataType} onChange={(e) => setDataType(e.target.value)}>
							<option value="">전체</option>
							<option value="LINK">링크</option>
							<option value="DOC">문서</option>
							<option value="VIDEO">영상</option>
						</select>
						<label className="bbs-post-filter-label">기간</label>
						<input type="date" className="bbs-post-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						<span className="bbs-post-filter-sep">~</span>
						<input type="date" className="bbs-post-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
					</div>
					<div className="bbs-post-filter-row">
						<label className="bbs-post-filter-label">검색어</label>
						<select className="bbs-post-filter-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
							<option value="all">전체</option>
							<option value="program">프로그램명</option>
							<option value="title">제목</option>
							<option value="file">첨부파일명</option>
						</select>
						<input type="text" className="bbs-post-filter-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="검색어" />
					</div>
					<div className="bbs-post-filter-actions">
						<button type="button" className="admin-list-btn-sky">검색</button>
						<button type="button" className="admin-filter-btn-reset" onClick={reset}>초기화</button>
					</div>
				</div>

				<table className="table">
					<thead>
						<tr>
							<th style={{ width: 80 }}>번호</th>
							<th style={{ width: 120 }}>학습유형</th>
							<th style={{ width: 180 }}>프로그램명</th>
							<th>게시글 제목</th>
							<th style={{ width: 220 }}>첨부파일명</th>
							<th style={{ width: 120 }}>다운로드 수</th>
							<th style={{ width: 140 }}>파일등록일</th>
						</tr>
					</thead>
					<tbody>
						<EmptyRow colSpan={7} />
					</tbody>
				</table>
				<ListPagination page={1} totalPages={1} onPageChange={() => undefined} />
			</CrudPageCard>
		</AdminLayout>
	)
}
