// 게시글 상세 화면이 글마다 제목·설명을 갖도록 경로와 게시판을 이어 주는 표

import type { PublicBoardId } from '@/lib/publicApi'

/**
 * 게시글 상세는 `?id=` 로 내용이 갈리는데 메타데이터는 pageRegistry 의 고정값을 쓰고 있었다.
 * 그래서 공지 173건이 모두 같은 제목("공지사항 | …")·같은 설명으로 색인되어
 * 검색엔진이 중복 문서로 볼 여지가 있었다.
 * 아래 표로 경로에서 게시판을 찾아, 글 제목과 본문 요약을 메타데이터에 넣는다.
 *
 * FAQ 는 아코디언이라 글마다 주소가 없어 넣지 않는다.
 */
export const BOARD_BY_DETAIL_PATH: Record<string, PublicBoardId> = {
	'news/notice_view': 'ZEHSB',
	'news/exhibit_view': 'EXHBT',
	'news/event_view': 'EVENT',
	'library/archive_view': 'LBARC'
}

export function boardIdForDetailPath(section: string, slug: string): PublicBoardId | null {
	return BOARD_BY_DETAIL_PATH[`${section}/${slug}`] ?? null
}
