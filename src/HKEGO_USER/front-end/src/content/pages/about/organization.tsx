'use client'

import { useEffect, useState } from 'react'
import type { PublicOrganizationMember } from '@/lib/publicApi'
import { getPublicOrganization } from '@/lib/publicApi'
import OrganizationTabs from '@/components/OrganizationTabs'

const ORGANIZATION_GROUPS = [
	{ code: 'DIRECTOR', title: '관장' },
	{ code: 'OPER', title: '운영부' },
	{ code: 'PLAN', title: '운영부-기획운영팀' },
	{ code: 'EXHIBIT', title: '운영부 > 전시체험팀' },
	{ code: 'GNRL', title: '총무부 > 총무팀' }
] as const

function OrganizationTable({ title, members }: {
	title: string
	members: PublicOrganizationMember[]
}) {
	return (
		<div className="lrbox">
			<h3 className="tit">{title}</h3>
			<div className="con tbl">
				<table>
					<colgroup>
						<col className="organization_position" />
						<col className="organization_task" />
						<col className="organization_telephone" />
					</colgroup>
					<thead>
						<tr><th>직위</th><th>담당업무</th><th>전화번호</th></tr>
					</thead>
					<tbody>
						{members.map((member) => (
							<tr key={member.organizationMemberId}>
								<th>{member.position}</th>
								<td className="organization_task" style={{ whiteSpace: 'pre-line' }}>{member.task}</td>
								<td>{member.telephone}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default function AboutOrganizationContent() {
	const [members, setMembers] = useState<PublicOrganizationMember[]>([])

	useEffect(() => {
		let cancelled = false
		void getPublicOrganization()
			.then((data) => {
				if (!cancelled) setMembers(data)
			})
			.catch(() => {
				if (!cancelled) setMembers([])
			})
		return () => {
			cancelled = true
		}
	}, [])
	const renderGroups = (codes: string[]) => (
		<div className="lrbox_area tit_slim">
			{ORGANIZATION_GROUPS.filter((group) => codes.includes(group.code)).map((group) => {
				const groupMembers = members.filter((member) => member.secondCategoryCode === group.code)
				return groupMembers.length > 0 ? (
					<OrganizationTable key={group.code} title={group.title} members={groupMembers} />
				) : null
			})}
		</div>
	)

	return (
		<section className="about_wrap inner" aria-labelledby="page-title">
			<h1 id="page-title" className="subtitle">조직도</h1>
			<div className="organization_chart">
				<div className="organization_hierarchy">
					<div className="boss">관장</div>
					<svg className="organization_connection_lines" viewBox="0 0 900 204" aria-hidden="true">
						<line x1="450" y1="0" x2="225" y2="100" />
						<line x1="450" y1="0" x2="675" y2="100" />
						<line x1="225" y1="100" x2="120" y2="204" />
						<line x1="225" y1="100" x2="330" y2="204" />
						<line x1="675" y1="100" x2="675" y2="204" />
					</svg>
					<div className="departments">
						<div className="department operation">
							<div className="department_name c1">운영부</div>
							<ul className="organization_teams">
								<li className="organization_team c1">기획운영팀</li>
								<li className="organization_team c2">전시체험팀</li>
							</ul>
						</div>
						<div className="department general">
							<div className="department_name c3">총무부</div>
							<ul className="organization_teams">
								<li className="organization_team c3">총무팀</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className="organization_list">
				<h2 className="sound_only">직위별 담당업무 및 전화번호</h2>
				{renderGroups(['DIRECTOR'])}
				<OrganizationTabs
					operation={renderGroups(['OPER', 'PLAN', 'EXHIBIT'])}
					general={renderGroups(['GNRL'])}
				/>
			</div>
		</section>
	)
}
