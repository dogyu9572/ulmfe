import { useState } from 'react'
import { TeacherShell } from './teacherShared'

const quickTexts = [
	'다음 존으로 이동해주세요. 5분 남았습니다!',
	'입력한 내용을 저장 버튼을 눌러 꼭 저장해주세요.',
	'QR 코드를 다시 스캔해주세요.',
	'잘 하고 있어요! 계속 진행해주세요.',
	'모든 활동을 완료한 학생은 자리에서 기다려주세요.'
]
const sentMessages = [
	['To. 전체(22명)', '다음 존으로 이동해주세요. 5분 남았습니다!'],
	['To. A팀', '지금부터 사건탐색을 시작하겠습니다. 퀘스트1 존으로 이동해주세요!'],
	['To. B팀', 'B팀 학생들은 2층 아이디어실로 먼저 이동해주세요.'],
	['To. C팀', 'C팀 학생들은 지금 목공실로 와주세요.'],
	['To. D팀', 'D팀 학생들은 지금 집으로 와주세요.!']
]

export const TeacherMessageSendingPage = () => {
	const [selectedTeams, setSelectedTeams] = useState<string[]>([])
	const [message, setMessage] = useState('')
	const selectAll = selectedTeams.length === 0

	const toggleTeam = (team: string) => {
		setSelectedTeams((prev) => {
			const next = prev.includes(team) ? prev.filter((item) => item !== team) : [...prev, team]
			return next.length === 0 || next.length === 4 ? [] : next
		})
	}

	return (
		<TeacherShell title="메시지 발송" info="학생 태블릿으로 메시지 전송">
			<div className="page_scroll">
				<div className="flex message_sending_wrap">
					<div className="wbox left">
						<h2 className="stit slim mt0">메세지 발송</h2>
						<div className="select_area">
							<div className="select_check"><input type="checkbox" id="selectAll" name="selectAll" checked={selectAll} onChange={() => setSelectedTeams([])} /><label htmlFor="selectAll"><span>전체(22명)</span></label></div>
							{['A팀', 'B팀', 'C팀', 'D팀'].map((team) => {
								const id = `select${team[0]}`
								return <div className="select_check" key={team}><input type="checkbox" id={id} name={id} className="team" checked={selectedTeams.includes(team)} onChange={() => toggleTeam(team)} /><label htmlFor={id}><span>{team}</span></label></div>
							})}
						</div>
						<div className="input_area"><textarea name="" id="" cols={30} rows={10} placeholder="학생들에게 보낼 메시지를 입력하세요." value={message} onChange={(event) => setMessage(event.target.value)}></textarea><div className="btns"><button type="button" className="btn btn_reset btn_kwg" onClick={() => setMessage('')}>초기화</button><button type="button" className="btn btn_reset btn_wbb">발송하기</button></div></div>
						<h2 className="stit slim">빠른 템플릿</h2>
						<ul className="quick_text">{quickTexts.map((text) => <li key={text}><button type="button" onClick={() => setMessage(text)}>{text}</button></li>)}</ul>
					</div>
					<div className="wbox right">
						<h2 className="stit slim mt0">발송 내역</h2>
						<ul className="send_list">{sentMessages.map(([to, text]) => <li key={`${to}-${text}`}><div className="to">{to}</div><div className="con"><div className="text">{text}</div><div className="day"><span>발송일시</span><span>10:10:00</span></div></div></li>)}</ul>
					</div>
				</div>
			</div>
		</TeacherShell>
	)
}
