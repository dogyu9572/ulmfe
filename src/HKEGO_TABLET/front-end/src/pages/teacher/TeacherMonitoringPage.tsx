import { TeacherShell } from './teacherShared'

const teams = [
	{ cls: 'c1', name: 'A팀', bars: [100, 100, 63, 0] },
	{ cls: 'c2', name: 'B팀', bars: [100, 100, 80, 0] },
	{ cls: 'c3', name: 'C팀', bars: [100, 100, 100, 0] },
	{ cls: 'c4', name: 'D팀', bars: [100, 100, 100, 60] }
]

export const TeacherMonitoringPage = () => (
	<TeacherShell title="모니터링" info="학생 참여 현황 및 팀 확인">
		<div className="page_scroll">
			<div className="monitoring_top"><h2 className="sound_only">간소화된 정보</h2><ul><li className="i1"><h3>전체 학생</h3><p><strong>22</strong>명</p></li><li className="i2"><h3>활동 진척률(전체평균)</h3><p><strong>28</strong>%</p></li><li className="i3"><h3>STEP별 소요시간(전체평균)</h3><p><strong>28</strong>분</p></li><li className="i4"><h3>진척률 100%</h3><p><strong>12</strong>명</p></li></ul></div>
			<h2 className="stit">팀 참여 현황</h2>
			<ul className="participation_teams">
				{teams.map((team) => <li className={team.cls} key={team.name}><div className="tit_area"><h3>{team.name}</h3><p><span>6명</span><span>2F ESD배움터 아이디어실1</span></p><div className="pct"><strong>68</strong>%</div></div><ul className="chart">{team.bars.map((bar, index) => <li className={`step${index + 1}`} key={index}><div className="line"><div className="bar" style={{ width: `${bar}%` }}></div></div><p><span>{index === 3 && bar === 60 ? 63 : bar}</span>%</p></li>)}</ul></li>)}
			</ul>
			<div className="stit">학생 참여 현황</div>
			<div className="participation_student wbox">
				<form className="board_top"><div className="left"><select name="" id="" className="w120"><option value="">팀 별</option></select><select name="" id="" className="w180"><option value="">STEP별 활동상태</option></select></div><div className="right"><select name="" id="" className="w120"><option value="">번호순</option></select><div className="search_area"><input type="text" placeholder="학생 이름 또는 번호를 검색하세요." /><button type="button" className="btn_search">검색</button></div></div></form>
				<div className="over_scroll"><div className="scroll"><div className="board_list"><table className="student-status-table"><caption>학생 참여 현황</caption><colgroup><col className="w58" /><col className="w70" /><col className="w70" /><col className="w94" /><col /><col className="w94" /><col className="w94" /><col className="w90" /></colgroup><thead><tr><th scope="col">번호</th><th scope="col">이름</th><th scope="col">팀</th><th scope="col">STEP 01</th><th scope="col">STEP 02</th><th scope="col">STEP 03</th><th scope="col">STEP 04</th><th scope="col">진척률</th></tr></thead><tbody>{[1, 2, 3, 4].map((num) => <tr key={num}><td>{num}</td><td><strong>홍길동</strong></td><td><strong className={`team${num}`}>{['A팀', 'B팀', 'C팀', 'D팀'][num - 1]}</strong></td><td><strong className="state end">완료</strong></td><td><ul className="step"><li className="end"><span>Q1</span>완료</li><li className={num === 2 || num === 3 ? 'end' : 'ing'}><span>Q2</span>{num === 2 || num === 3 ? '완료' : '진행중'}</li><li className={num === 2 || num === 3 ? 'end' : 'before'}><span>Q3</span>{num === 2 || num === 3 ? '완료' : '진행전'}</li><li className={num === 2 || num === 3 ? 'end' : 'before'}><span>Q4</span>{num === 2 || num === 3 ? '완료' : '진행전'}</li></ul></td><td><strong className={`state ${num === 3 ? 'end' : num === 2 ? 'ing' : 'before'}`}>{num === 3 ? '완료' : num === 2 ? '진행중' : '진행전'}</strong></td><td><strong className={`state ${num === 3 ? 'end' : 'before'}`}>{num === 3 ? '완료' : '진행전'}</strong></td><td><div className="chart"><strong>{num === 3 ? 100 : num === 2 ? 50 : 30}</strong>%</div></td></tr>)}</tbody></table></div></div></div>
			</div>
		</div>
	</TeacherShell>
)
