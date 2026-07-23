import type { PublicOrganizationMember } from '@/lib/publicApi'
import { getPublicOrganizationServer } from '@/lib/publicApiServer'

const ORGANIZATION_GROUPS = [
	{ code: 'DIRECTOR', title: '관장' },
	{ code: 'PLAN', title: '기획운영팀' },
	{ code: 'EDU', title: '교육팀' },
	{ code: 'FACILITY', title: '시설팀' }
] as const

const positionName = (groupCode: string, index: number) => {
	if (groupCode === 'DIRECTOR') return '관장'
	return index === 0 ? '팀장' : '주무관'
}

function OrganizationTable({ title, groupCode, members }: {
	title: string
	groupCode: string
	members: PublicOrganizationMember[]
}) {
	return (
		<div className="lrbox">
			<h3 className="tit">{title}</h3>
			<div className="con tbl">
				<table>
					<colgroup>
						<col className="mo_organization1" />
						<col className="mo_organization2" />
						<col />
					</colgroup>
					<thead>
						<tr><th>직위</th><th>담당업무</th><th>전화번호</th></tr>
					</thead>
					<tbody>
						{members.map((member, index) => (
							<tr key={member.organizationMemberId}>
								<th>{positionName(groupCode, index)}</th>
								<td>{member.task}</td>
								<td>{member.telephone}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default async function AboutOrganizationContent() {
	const members = await getPublicOrganizationServer().catch(() => [])

	return (
		<section className="about_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">조직도</h1>
			<div className="organization_chart">
				<div className="flex"><p className="excl">조직도를 클릭하여 부서별 주요 업무와 연락처를 확인해 보세요.</p></div>
				<div className="boss">관장</div>
				<ul className="teams">
					<li className="c1">기획운영팀</li>
					<li className="c2">교육팀</li>
					<li className="c3">시설팀</li>
				</ul>
			</div>
			<div className="organization_list">
				<h2 className="sound_only">직위별 담당업무 및 전화번호</h2>
				<div className="lrbox_area tit_slim">
					{ORGANIZATION_GROUPS.map((group) => {
						const groupMembers = members.filter((member) => member.secondCategoryCode === group.code)
						return groupMembers.length > 0 ? (
							<OrganizationTable key={group.code} title={group.title} groupCode={group.code} members={groupMembers} />
						) : null
					})}
				</div>
			</div>
		</section>
	)
}
