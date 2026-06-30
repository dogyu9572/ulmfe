import { TeacherShell, teacherResources } from './teacherShared'

export const TeacherResourceCenterPage = () => (
	<TeacherShell title="자료실" info="홈페이지 연계 자료 및 교육 콘텐츠">
		<div className="page_scroll">
			<div className="board_top"><div className="select_tab"><button type="button" className="btn on" id="selectAll">전체</button><button type="button" className="btn ico" id="selectDocument">문서</button><button type="button" className="btn ico" id="selectVideo">동영상</button></div><div className="search_area"><input type="text" placeholder="자료를 검색하세요." /><button className="btn_search"></button></div></div>
			<h2 className="sound_only">자료실 목록</h2>
			<ul className="resource_wrap">{teacherResources.map((resource) => <li key={resource.title}><div className={`type ${resource.type}`}>{resource.label}</div><h3 className="tit">{resource.title}</h3><p>{resource.text}</p><a href={resource.href} target="_blank" className="btn">{resource.button}</a></li>)}</ul>
		</div>
	</TeacherShell>
)
