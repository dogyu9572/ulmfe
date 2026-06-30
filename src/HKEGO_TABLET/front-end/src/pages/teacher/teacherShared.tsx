import { ReactNode } from 'react'
import { TeacherHeader } from '../../components/tablet/TeacherHeader'

export const TeacherShell = ({ title, info, children, flexCenter = true, subtitleExtra }: { title: string; info?: string; children: ReactNode; flexCenter?: boolean; subtitleExtra?: ReactNode }) => (
	<main className={`container${flexCenter ? ' flex_center' : ''}`} id="mainContent">
		<h1 className="sound_only">{title}</h1>
		<TeacherHeader />
		<section className="basic_board">
			<div className="subtitle"><strong>{title}</strong>{info !== undefined && <p className="info">{info}</p>}{subtitleExtra}</div>
			{children}
		</section>
	</main>
)

export const teacherResources = [
	{ type: 'document', label: '문서', title: '사건탐구 교사용 지도안', text: '전체 프로그램 운영 가이드 및 단계별 진행 방법', href: '/pub/pdf/sample_document.pdf', button: '다운로드' },
	{ type: 'document', label: '문서', title: 'SDGs 교육 자료', text: '지속가능발전목표 관련 교육 참고 자료', href: '/pub/pdf/sample_document.pdf', button: '다운로드' },
	{ type: 'video', label: '동영상', title: '도입영상(스토리)', text: '스토리 도입 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: '도입영상(콘셉트)', text: '콘셉트 도입 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: '도입영상(러닝맵)', text: '러닝맵 도입 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: 'OT(안전교육 영상)', text: '안전교육 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: 'OT(활동동선 안내)', text: '활동동선 안내 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'video', label: '동영상', title: 'OT(사용법 튜토리얼)', text: '사용법 튜토리얼 영상', href: 'https://www.youtube.com/watch?v=AAhUypcfoxE', button: '보기' },
	{ type: 'document', label: '문서', title: '활동지 양식 ', text: '사건탐구 퀘스트 활동지', href: '/pub/pdf/sample_document.pdf', button: '다운로드' },
	{ type: 'document', label: '문서', title: '평가지 양식', text: '사건탐구 평가지', href: '/pub/pdf/sample_document.pdf', button: '다운로드' },
	{ type: 'document', label: '문서', title: '설문지 양식', text: '사건탐구 설문지', href: '/pub/pdf/sample_document.pdf', button: '다운로드' }
]
