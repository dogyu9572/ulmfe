import React from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { CrudPageCard } from '../components/CrudPageCard'

type AdminComingSoonPageProps = {
	title: string
}

export const AdminComingSoonPage: React.FC<AdminComingSoonPageProps> = ({ title }) => (
	<AdminLayout title={title}>
		<CrudPageCard title={title} disableInnerPanel>
			<div className="admin-coming-soon">
				이 메뉴는 다음 단계에서 화면 단위로 개발합니다.
			</div>
		</CrudPageCard>
	</AdminLayout>
)
