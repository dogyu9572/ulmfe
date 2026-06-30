import { useState } from 'react'
import { TeacherShell } from './teacherShared'

const callItems = [
	{ cls: 'team_a', team: 'A팀', place: 'ESD배움터 아이디어실' },
	{ cls: 'team_b', team: 'B팀', place: 'ESD배움터 아이디어실' },
	{ cls: 'team_c', team: 'C팀', place: 'ESD배움터 아이디어실' },
	{ cls: 'team_d', team: 'D팀', place: 'ESD배움터 아이디어실', read: true }
]

export const TeacherCallHistoryPage = () => {
	const [readItems, setReadItems] = useState(() => callItems.map((item) => Boolean(item.read)))

	return (
		<TeacherShell
			title="호출 내역"
			info="학생이 요청한 호출 내역"
			subtitleExtra={<button type="button" id="checkAll" className="btn btn_wbb btn_right" onClick={() => setReadItems(callItems.map(() => true))}>모두 읽음 처리</button>}
		>
			<div className="page_scroll">
				<h2 className="sound_only">호출내역 목록</h2>
				<ul className="call_history_wrap">
					{callItems.map((item, index) => <li className={readItems[index] ? 'read' : undefined} key={`${item.team}-${index}`}><div className="left"><div className="tit"><span className={item.cls}>{item.team}</span>{item.place}</div><div className="con">선생님을 호출했어요.</div></div><div className="right"><time className="time">10:50:05</time><button type="button" className="btn btn_wbb" onClick={() => setReadItems((prev) => prev.map((read, readIndex) => readIndex === index ? true : read))}>읽음</button></div></li>)}
				</ul>
			</div>
		</TeacherShell>
	)
}
