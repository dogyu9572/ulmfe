import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

export type LegacyEffect = 'history' | 'library-month' | 'library-sliders' | 'location-map' | 'program-height' | 'program-slider' | 'popup' | 'total-search-tabs'

export type LegacyPageDefinition = {
	section: string
	slug: string
	title: string
	menuIndex: number | null
	description?: string
	styles: string[]
	effect?: LegacyEffect
	activeHref?: string
}

export type LegacyPage = LegacyPageDefinition & {
	mainClassName: string
	contentHtml: string
}

const ABOUT_DESCRIPTION = '울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.'
const EXHIBIT_DESCRIPTION = '지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.'
const PROGRAM_DESCRIPTION = '질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.'
const ARCHIVE_DESCRIPTION = '방문 전·중·후, 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.'
const NEWS_DESCRIPTION = '울산광역시미래교육관의 새로운 소식을 전합니다.'
const SUPPORT_DESCRIPTION = '울산광역시미래교육관의 새로운 소식을 전합니다.'
const GALLERY_DESCRIPTION = '울산광역시미래교육관의 새로운 소식을 전합니다.'
const LIBRARY_DESCRIPTION = '지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.'

const SUB_STYLE = '/pub/css/styles_sub.css'

export const LEGACY_PAGE_DEFINITIONS: LegacyPageDefinition[] = [
	{ section: 'about', slug: 'greeting', title: '인사말', menuIndex: 0, description: ABOUT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_about.css'] },
	{ section: 'about', slug: 'vision', title: '미션 및 비전', menuIndex: 0, description: ABOUT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_about.css'] },
	{ section: 'about', slug: 'history', title: '연혁', menuIndex: 0, description: ABOUT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_about.css'], effect: 'history' },
	{ section: 'about', slug: 'organization', title: '조직도', menuIndex: 0, description: ABOUT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_about.css'] },
	{ section: 'about', slug: 'ci', title: 'CI', menuIndex: 0, description: ABOUT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_about.css'] },
	{ section: 'about', slug: 'location', title: '오시는 길', menuIndex: 0, description: ABOUT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_about.css'], effect: 'location-map' },
	{ section: 'exhibit', slug: 'floor_1f', title: '1F [질문]', menuIndex: 1, description: EXHIBIT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_exhibit.css'], effect: 'popup' },
	{ section: 'exhibit', slug: 'floor_2f', title: '2F [탐구]', menuIndex: 1, description: EXHIBIT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_exhibit.css'], effect: 'popup' },
	{ section: 'exhibit', slug: 'floor_3f', title: '3F [모험]', menuIndex: 1, description: EXHIBIT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_exhibit.css'], effect: 'popup' },
	{ section: 'exhibit', slug: 'annex', title: '별관 [생각]', menuIndex: 1, description: EXHIBIT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_exhibit.css'], effect: 'popup' },
	{ section: 'exhibit', slug: 'outdoor', title: '야외 [놀이]', menuIndex: 1, description: EXHIBIT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_exhibit.css'], effect: 'popup' },
	{ section: 'program', slug: 'esd_pbl', title: 'ESD/PBL 소개', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-height' },
	{ section: 'program', slug: 'elementary', title: '사건탐구 프로그램(초5)', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-height' },
	{ section: 'program', slug: 'mission', title: '미션 프로그램(중1)', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-height' },
	{ section: 'program', slug: 'special', title: '방학/주말 특별프로그램', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'] },
	{ section: 'program', slug: 'reserve', title: '예약 안내', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'] },
	{ section: 'program', slug: 'elementary1', title: '사건탐구 프로그램(초5)', menuIndex: 2, activeHref: '/program/elementary', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'elementary2', title: '사건탐구 프로그램(초5)', menuIndex: 2, activeHref: '/program/elementary', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'elementary3', title: '사건탐구 프로그램(초5)', menuIndex: 2, activeHref: '/program/elementary', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'elementary4', title: '사건탐구 프로그램(초5)', menuIndex: 2, activeHref: '/program/elementary', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'elementary5', title: '사건탐구 프로그램(초5)', menuIndex: 2, activeHref: '/program/elementary', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'mission1', title: '미션 프로그램(중1)', menuIndex: 2, activeHref: '/program/mission', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'mission2', title: '미션 프로그램(중1)', menuIndex: 2, activeHref: '/program/mission', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'mission3', title: '미션 프로그램(중1)', menuIndex: 2, activeHref: '/program/mission', description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'program-slider' },
	{ section: 'program', slug: 'biggame', title: '빅게임 프로그램', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'popup' },
	{ section: 'program', slug: 'free', title: '자유 체험', menuIndex: 2, description: PROGRAM_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_program.css'], effect: 'popup' },
	{ section: 'archive', slug: 'elementary', title: '사건탐구 프로그램', menuIndex: 3, description: ARCHIVE_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_list.css'] },
	{ section: 'archive', slug: 'elementary_view', title: '사건탐구 프로그램', menuIndex: 3, activeHref: '/archive/elementary', description: ARCHIVE_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_view.css'] },
	{ section: 'archive', slug: 'mission', title: '미션 프로그램', menuIndex: 3, description: ARCHIVE_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_list.css'] },
	{ section: 'archive', slug: 'mission_view', title: '미션 프로그램', menuIndex: 3, activeHref: '/archive/mission', description: ARCHIVE_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_view.css'] },
	{ section: 'news', slug: 'notice', title: '공지사항', menuIndex: 4, description: NEWS_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_list.css'] },
	{ section: 'news', slug: 'notice_view', title: '공지사항', menuIndex: 4, activeHref: '/news/notice', description: NEWS_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_view.css'] },
	{ section: 'news', slug: 'exhibit', title: '기획전', menuIndex: 4, description: NEWS_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_gallery_list.css'] },
	{ section: 'news', slug: 'exhibit_view', title: '기획전', menuIndex: 4, activeHref: '/news/exhibit', description: NEWS_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_view.css'] },
	{ section: 'news', slug: 'event', title: '이벤트', menuIndex: 4, description: NEWS_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_gallery_list.css'] },
	{ section: 'news', slug: 'event_view', title: '이벤트', menuIndex: 4, activeHref: '/news/event', description: NEWS_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_view.css'] },
	{ section: 'support', slug: 'faq', title: 'FAQ', menuIndex: 5, description: SUPPORT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_support.css'] },
	{ section: 'support', slug: 'qna', title: '1:1문의', menuIndex: 5, description: SUPPORT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_list.css'], effect: 'popup' },
	{ section: 'support', slug: 'qna_write', title: '1:1문의', menuIndex: 5, activeHref: '/support/qna', description: SUPPORT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_write.css'] },
	{ section: 'support', slug: 'qna_view', title: '1:1문의', menuIndex: 5, activeHref: '/support/qna', description: SUPPORT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_view.css'] },
	{ section: 'support', slug: 'qna_modify', title: '1:1문의', menuIndex: 5, activeHref: '/support/qna', description: SUPPORT_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_board_write.css'] },
	{ section: 'gallery', slug: 'index', title: '갤러리', menuIndex: 6, description: GALLERY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_gallery_list.css'], effect: 'popup' },
	{ section: 'library', slug: 'info', title: '도서관 안내', menuIndex: 7, description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_library.css'] },
	{ section: 'library', slug: 'search', title: '자료검색', menuIndex: 7, description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_library.css'], effect: 'library-sliders' },
	{ section: 'library', slug: 'search_list', title: '자료검색', menuIndex: 7, activeHref: '/library/search', description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_library.css'] },
	{ section: 'library', slug: 'search_view', title: '자료검색', menuIndex: 7, activeHref: '/library/search', description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_library.css'] },
	{ section: 'library', slug: 'recommend', title: '사서 추천도서', menuIndex: 7, description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_library.css'] },
	{ section: 'library', slug: 'recommend_view', title: '사서 추천도서', menuIndex: 7, activeHref: '/library/recommend', description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_library.css'] },
	{ section: 'library', slug: 'new', title: '새로 들어온 도서', menuIndex: 7, description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_library.css'], effect: 'library-month' },
	{ section: 'library', slug: 'new_view', title: '새로 들어온 도서', menuIndex: 7, activeHref: '/library/new', description: LIBRARY_DESCRIPTION, styles: [SUB_STYLE, '/pub/css/styles_library.css'] },
	{ section: 'total_search', slug: 'index', title: '통합검색', menuIndex: null, styles: [SUB_STYLE, '/pub/css/styles_board_public.css', '/pub/css/styles_total_search.css'], effect: 'total-search-tabs' },
	{ section: 'terms', slug: 'policy', title: '이용약관', menuIndex: null, styles: [SUB_STYLE, '/pub/css/styles_terms.css'] },
	{ section: 'terms', slug: 'privacy', title: '개인정보처리방침', menuIndex: null, styles: [SUB_STYLE, '/pub/css/styles_terms.css'] },
	{ section: 'terms', slug: 'no_email', title: '이메일 무단수집거부', menuIndex: null, styles: [SUB_STYLE, '/pub/css/styles_terms.css'] },
	{ section: 'terms', slug: 'cctv', title: '영상정보처리기기 운영방침', menuIndex: null, styles: [SUB_STYLE, '/pub/css/styles_terms.css'] }
]

const DEFINITION_BY_ROUTE = new Map(
	LEGACY_PAGE_DEFINITIONS.map((page) => [`${page.section}/${page.slug}`, page])
)

const CONVERTED_HREFS = LEGACY_PAGE_DEFINITIONS.map(
	(page) => `/${page.section}/${page.slug}`
)

function extractPageContent(definition: LegacyPageDefinition): Pick<LegacyPage, 'mainClassName' | 'contentHtml'> {
	const publishingRoot = path.resolve(process.cwd(), '../../../docs/ulsan_homepage')
	const sourceRoot = fs.existsSync(publishingRoot) ? publishingRoot : path.join(process.cwd(), 'public')
	const sourcePath = path.join(sourceRoot, definition.section, `${definition.slug}.html`)
	const source = fs.readFileSync(sourcePath, 'utf8')
	const mainMatch = source.match(/<main\s+class="([^"]+)"\s+id="mainContent">([\s\S]*?)<\/main>/i)
	if (!mainMatch) throw new Error(`Main content not found: ${sourcePath}`)

	let contentHtml = mainMatch[2]
		.replace(/<div\s+data-include="\/pub\/inc\/aside\.html"><\/div>\s*/i, '')
		.replace(/(<h1[^>]*class="subtitle"[^>]*>)\s*(<\/h1>)/i, `$1${definition.title}$2`)
		.trim()

	for (const href of CONVERTED_HREFS) {
		contentHtml = contentHtml.replaceAll(`href="${href}.html"`, `href="${href}"`)
		contentHtml = contentHtml.replaceAll(`action="${href}.html"`, `action="${href}"`)
		contentHtml = contentHtml.replaceAll(`location.href='${href}.html'`, `location.href='${href}'`)
	}

	if (definition.section === 'total_search') {
		contentHtml = contentHtml.replace('<form action="" method="get" class="search_wrap">', '<form action="/total_search/index" method="get" class="search_wrap">')
	}

	if (definition.section === 'support' && definition.slug === 'faq') {
		const faqClick = "const box=this.parentElement;const wasOpen=box.classList.contains('on');document.querySelectorAll('.faq_wrap .box.on').forEach((item)=>{item.classList.remove('on');item.querySelector('.question')?.setAttribute('aria-expanded','false')});if(!wasOpen){box.classList.add('on');this.setAttribute('aria-expanded','true')}"
		contentHtml = contentHtml.replaceAll(
			'<button type="button" class="question">',
			`<button type="button" class="question" aria-expanded="false" onclick="${faqClick}">`
		)
	}

	if (definition.section === 'gallery' && definition.slug === 'index') {
		const popupSource = fs.readFileSync(path.join(sourceRoot, 'gallery', 'pop_view.html'), 'utf8').trim()
		contentHtml = `${contentHtml.replaceAll('data-target="pop01"', 'data-target="pop_gallery"')}\n${popupSource}`
	}

	if (definition.effect === 'popup') {
		const popupOpen = "const popup=document.getElementById(this.getAttribute('data-target'));if(popup){popup.classList.add('open');popup.querySelector('.btn_close')?.focus();if(window.Swiper&&popup.classList.contains('pop_gallery')&&!popup.dataset.sliderReady){const navEl=popup.querySelector('.gallery_nav');const mainEl=popup.querySelector('.gallery_for');if(navEl&&mainEl){const nav=new Swiper(navEl,{spaceBetween:8,freeMode:true,watchSlidesProgress:true,slidesPerView:3,breakpoints:{768:{slidesPerView:4,spaceBetween:10},1024:{slidesPerView:6,spaceBetween:12}}});new Swiper(mainEl,{spaceBetween:10,pagination:{el:mainEl.querySelector('.pagination'),clickable:true},thumbs:{swiper:nav}});popup.dataset.sliderReady='true'}}}return false"
		const popupClose = "this.closest('.popup')?.classList.remove('open');return false"
		contentHtml = contentHtml
			.replace(/class="([^"]*\bbtn_popup\b[^"]*)"\s+data-target=/g, `class="$1" onclick="${popupOpen}" data-target=`)
			.replace(/class="([^"]*\bbtn_close\b[^"]*)"/g, `class="$1" onclick="${popupClose}"`)
			.replace(/class="([^"]*\bbtn_clo\b[^"]*)"/g, `class="$1" onclick="${popupClose}"`)
			.replace(/<div class="dm"><\/div>/g, `<div class="dm" onclick="${popupClose}"></div>`)
	}

	return { mainClassName: mainMatch[1], contentHtml }
}

export function getLegacyPage(section: string, slug: string): LegacyPage | null {
	const definition = DEFINITION_BY_ROUTE.get(`${section}/${slug}`)
	if (!definition) return null
	return { ...definition, ...extractPageContent(definition) }
}
