import NewsBoardList, { type CategoryFilter } from './NewsBoardList'
import type { PublicBoardId } from '@/lib/publicApi'

const LEARNING_TYPE_FILTER: CategoryFilter = {
	label: '학습 유형',
	options: [
		{ value: 'PRE', label: '사전학습' },
		{ value: 'MAIN', label: '본학습' },
		{ value: 'POST', label: '사후학습' }
	]
}

const ESD_ZONE_FILTER: CategoryFilter = {
	label: 'ESD 체험터',
	queryKey: 'zone',
	display: 'tabs',
	options: [
		{ value: 'FUTURE', label: '미래존' },
		{ value: 'EARTH', label: '지구존' },
		{ value: 'SOCIETY', label: '사회존' }
	]
}

type Props = {
	boardId: PublicBoardId
	title: string
	detailPath: string
	variant: 'notice' | 'gallery-large' | 'gallery-small'
	programType?: 'EXPLORE' | 'MISSION'
	showLearningTypeFilter?: boolean
	showEsdZoneFilter?: boolean
	categoryFilter?: CategoryFilter
}

export default function NewsBoardListPage({ boardId, title, detailPath, variant, programType, showLearningTypeFilter, showEsdZoneFilter, categoryFilter }: Props) {
	const resolvedCategoryFilter = categoryFilter ?? (showEsdZoneFilter ? ESD_ZONE_FILTER : showLearningTypeFilter ? LEARNING_TYPE_FILTER : undefined)
	return (
		<NewsBoardList
			boardId={boardId}
			title={title}
			detailPath={detailPath}
			variant={variant}
			programType={programType}
			categoryFilter={resolvedCategoryFilter}
		/>
	)
}
