import type { ComponentType } from 'react'
import AboutGreetingContent from './pages/about/greeting'
import AboutVisionContent from './pages/about/vision'
import AboutHistoryContent from './pages/about/history'
import AboutOrganizationContent from './pages/about/organization'
import AboutCiContent from './pages/about/ci'
import AboutLocationContent from './pages/about/location'
import ExhibitFloor1fContent from './pages/exhibit/floor_1f'
import ExhibitFloor2fContent from './pages/exhibit/floor_2f'
import ExhibitFloor3fContent from './pages/exhibit/floor_3f'
import ExhibitAnnexContent from './pages/exhibit/annex'
import ExhibitOutdoorContent from './pages/exhibit/outdoor'
import ProgramEsdPblContent from './pages/program/esd_pbl'
import ProgramElementaryContent from './pages/program/elementary'
import ProgramMissionContent from './pages/program/mission'
import ProgramSpecialContent from './pages/program/special'
import ProgramReserveContent from './pages/program/reserve'
import ProgramElementary1Content from './pages/program/elementary1'
import ProgramElementary2Content from './pages/program/elementary2'
import ProgramElementary3Content from './pages/program/elementary3'
import ProgramElementary4Content from './pages/program/elementary4'
import ProgramElementary5Content from './pages/program/elementary5'
import ProgramMission1Content from './pages/program/mission1'
import ProgramMission2Content from './pages/program/mission2'
import ProgramMission3Content from './pages/program/mission3'
import ProgramBiggameContent from './pages/program/biggame'
import ProgramFreeContent from './pages/program/free'
import ArchiveElementaryContent from './pages/archive/elementary'
import ArchiveElementaryViewContent from './pages/archive/elementary_view'
import ArchiveMissionContent from './pages/archive/mission'
import ArchiveMissionViewContent from './pages/archive/mission_view'
import NewsNoticeContent from './pages/news/notice'
import NewsNoticeViewContent from './pages/news/notice_view'
import NewsExhibitContent from './pages/news/exhibit'
import NewsExhibitViewContent from './pages/news/exhibit_view'
import NewsEventContent from './pages/news/event'
import NewsEventViewContent from './pages/news/event_view'
import SupportFaqContent from './pages/support/faq'
import SupportQnaContent from './pages/support/qna'
import SupportQnaWriteContent from './pages/support/qna_write'
import SupportQnaViewContent from './pages/support/qna_view'
import SupportQnaModifyContent from './pages/support/qna_modify'
import GalleryIndexContent from './pages/gallery/index'
import LibraryInfoContent from './pages/library/info'
import LibrarySearchContent from './pages/library/search'
import LibrarySearchListContent from './pages/library/search_list'
import LibrarySearchViewContent from './pages/library/search_view'
import LibraryRecommendContent from './pages/library/recommend'
import LibraryRecommendViewContent from './pages/library/recommend_view'
import LibraryNewContent from './pages/library/new'
import LibraryNewViewContent from './pages/library/new_view'
import TotalSearchIndexContent from './pages/total_search/index'
import TermsPolicyContent from './pages/terms/policy'
import TermsPrivacyContent from './pages/terms/privacy'
import TermsNoEmailContent from './pages/terms/no_email'
import TermsCctvContent from './pages/terms/cctv'

export type PageBehaviorName = 'faq' | 'history' | 'library-month' | 'library-sliders' | 'location-map' | 'program-height' | 'program-slider' | 'popup' | 'total-search-tabs'

export type PageDefinition = {
	section: string
	slug: string
	title: string
	menuIndex: number | null
	description?: string
	styles: string[]
	behavior?: PageBehaviorName
	activeHref?: string
	mainClassName: string
	Content: ComponentType
}

export const PAGE_DEFINITIONS: PageDefinition[] = [
	{ section: "about", slug: "greeting", title: "인사말", menuIndex: 0, description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_about.css"], mainClassName: "container sub_wrap", Content: AboutGreetingContent },
	{ section: "about", slug: "vision", title: "미션 및 비전", menuIndex: 0, description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_about.css"], mainClassName: "container sub_wrap", Content: AboutVisionContent },
	{ section: "about", slug: "history", title: "연혁", menuIndex: 0, description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_about.css"], behavior: "history", mainClassName: "container sub_wrap", Content: AboutHistoryContent },
	{ section: "about", slug: "organization", title: "조직도", menuIndex: 0, description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_about.css"], mainClassName: "container sub_wrap", Content: AboutOrganizationContent },
	{ section: "about", slug: "ci", title: "CI", menuIndex: 0, description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_about.css"], mainClassName: "container sub_wrap", Content: AboutCiContent },
	{ section: "about", slug: "location", title: "오시는 길", menuIndex: 0, description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_about.css"], behavior: "location-map", mainClassName: "container sub_wrap", Content: AboutLocationContent },
	{ section: "exhibit", slug: "floor_1f", title: "1F [질문]", menuIndex: 1, description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_exhibit.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitFloor1fContent },
	{ section: "exhibit", slug: "floor_2f", title: "2F [탐구]", menuIndex: 1, description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_exhibit.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitFloor2fContent },
	{ section: "exhibit", slug: "floor_3f", title: "3F [모험]", menuIndex: 1, description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_exhibit.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitFloor3fContent },
	{ section: "exhibit", slug: "annex", title: "별관 [생각]", menuIndex: 1, description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_exhibit.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitAnnexContent },
	{ section: "exhibit", slug: "outdoor", title: "야외 [놀이]", menuIndex: 1, description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_exhibit.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitOutdoorContent },
	{ section: "program", slug: "esd_pbl", title: "ESD/PBL 소개", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-height", mainClassName: "container sub_wrap pb0", Content: ProgramEsdPblContent },
	{ section: "program", slug: "elementary", title: "사건탐구 프로그램(초5)", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-height", mainClassName: "container sub_wrap pb0", Content: ProgramElementaryContent },
	{ section: "program", slug: "mission", title: "미션 프로그램(중1)", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-height", mainClassName: "container sub_wrap pb0", Content: ProgramMissionContent },
	{ section: "program", slug: "special", title: "방학/주말 특별프로그램", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], mainClassName: "container sub_wrap pb0", Content: ProgramSpecialContent },
	{ section: "program", slug: "reserve", title: "예약 안내", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], mainClassName: "container sub_wrap pb0", Content: ProgramReserveContent },
	{ section: "program", slug: "elementary1", title: "사건탐구 프로그램(초5)", menuIndex: 2, activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary1Content },
	{ section: "program", slug: "elementary2", title: "사건탐구 프로그램(초5)", menuIndex: 2, activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary2Content },
	{ section: "program", slug: "elementary3", title: "사건탐구 프로그램(초5)", menuIndex: 2, activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary3Content },
	{ section: "program", slug: "elementary4", title: "사건탐구 프로그램(초5)", menuIndex: 2, activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary4Content },
	{ section: "program", slug: "elementary5", title: "사건탐구 프로그램(초5)", menuIndex: 2, activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary5Content },
	{ section: "program", slug: "mission1", title: "미션 프로그램(중1)", menuIndex: 2, activeHref: "/program/mission", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramMission1Content },
	{ section: "program", slug: "mission2", title: "미션 프로그램(중1)", menuIndex: 2, activeHref: "/program/mission", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramMission2Content },
	{ section: "program", slug: "mission3", title: "미션 프로그램(중1)", menuIndex: 2, activeHref: "/program/mission", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramMission3Content },
	{ section: "program", slug: "biggame", title: "빅게임 프로그램", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "popup", mainClassName: "container sub_wrap pb0", Content: ProgramBiggameContent },
	{ section: "program", slug: "free", title: "자유 체험", menuIndex: 2, description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_program.css"], behavior: "popup", mainClassName: "container sub_wrap pb0", Content: ProgramFreeContent },
	{ section: "archive", slug: "elementary", title: "사건탐구 프로그램", menuIndex: 3, description: "방문 전·중·후, 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_list.css"], mainClassName: "container sub_wrap", Content: ArchiveElementaryContent },
	{ section: "archive", slug: "elementary_view", title: "사건탐구 프로그램", menuIndex: 3, activeHref: "/archive/elementary", description: "방문 전·중·후, 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_view.css"], mainClassName: "container sub_wrap", Content: ArchiveElementaryViewContent },
	{ section: "archive", slug: "mission", title: "미션 프로그램", menuIndex: 3, description: "방문 전·중·후, 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_list.css"], mainClassName: "container sub_wrap", Content: ArchiveMissionContent },
	{ section: "archive", slug: "mission_view", title: "미션 프로그램", menuIndex: 3, activeHref: "/archive/mission", description: "방문 전·중·후, 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_view.css"], mainClassName: "container sub_wrap", Content: ArchiveMissionViewContent },
	{ section: "news", slug: "notice", title: "공지사항", menuIndex: 4, description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_list.css"], mainClassName: "container sub_wrap", Content: NewsNoticeContent },
	{ section: "news", slug: "notice_view", title: "공지사항", menuIndex: 4, activeHref: "/news/notice", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_view.css"], mainClassName: "container sub_wrap", Content: NewsNoticeViewContent },
	{ section: "news", slug: "exhibit", title: "기획전", menuIndex: 4, description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_gallery_list.css"], mainClassName: "container sub_wrap", Content: NewsExhibitContent },
	{ section: "news", slug: "exhibit_view", title: "기획전", menuIndex: 4, activeHref: "/news/exhibit", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_view.css"], mainClassName: "container sub_wrap", Content: NewsExhibitViewContent },
	{ section: "news", slug: "event", title: "이벤트", menuIndex: 4, description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_gallery_list.css"], mainClassName: "container sub_wrap", Content: NewsEventContent },
	{ section: "news", slug: "event_view", title: "이벤트", menuIndex: 4, activeHref: "/news/event", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_view.css"], mainClassName: "container sub_wrap", Content: NewsEventViewContent },
	{ section: "support", slug: "faq", title: "FAQ", menuIndex: 5, description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_support.css"], behavior: "faq", mainClassName: "container sub_wrap", Content: SupportFaqContent },
	{ section: "support", slug: "qna", title: "1:1문의", menuIndex: 5, description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_list.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: SupportQnaContent },
	{ section: "support", slug: "qna_write", title: "1:1문의", menuIndex: 5, activeHref: "/support/qna", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_write.css"], mainClassName: "container sub_wrap", Content: SupportQnaWriteContent },
	{ section: "support", slug: "qna_view", title: "1:1문의", menuIndex: 5, activeHref: "/support/qna", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_view.css"], mainClassName: "container sub_wrap", Content: SupportQnaViewContent },
	{ section: "support", slug: "qna_modify", title: "1:1문의", menuIndex: 5, activeHref: "/support/qna", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_board_write.css"], mainClassName: "container sub_wrap", Content: SupportQnaModifyContent },
	{ section: "gallery", slug: "index", title: "갤러리", menuIndex: 6, description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_gallery_list.css"], behavior: "popup", mainClassName: "container sub_wrap", Content: GalleryIndexContent },
	{ section: "library", slug: "info", title: "도서관 안내", menuIndex: 7, description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_library.css"], mainClassName: "container sub_wrap", Content: LibraryInfoContent },
	{ section: "library", slug: "search", title: "자료검색", menuIndex: 7, description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_library.css"], behavior: "library-sliders", mainClassName: "container sub_wrap", Content: LibrarySearchContent },
	{ section: "library", slug: "search_list", title: "자료검색", menuIndex: 7, activeHref: "/library/search", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_library.css"], mainClassName: "container sub_wrap", Content: LibrarySearchListContent },
	{ section: "library", slug: "search_view", title: "자료검색", menuIndex: 7, activeHref: "/library/search", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_library.css"], mainClassName: "container sub_wrap", Content: LibrarySearchViewContent },
	{ section: "library", slug: "recommend", title: "사서 추천도서", menuIndex: 7, description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_library.css"], mainClassName: "container sub_wrap", Content: LibraryRecommendContent },
	{ section: "library", slug: "recommend_view", title: "사서 추천도서", menuIndex: 7, activeHref: "/library/recommend", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_library.css"], mainClassName: "container sub_wrap", Content: LibraryRecommendViewContent },
	{ section: "library", slug: "new", title: "새로 들어온 도서", menuIndex: 7, description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_library.css"], behavior: "library-month", mainClassName: "container sub_wrap", Content: LibraryNewContent },
	{ section: "library", slug: "new_view", title: "새로 들어온 도서", menuIndex: 7, activeHref: "/library/new", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: ["/pub/css/styles_sub.css","/pub/css/styles_library.css"], mainClassName: "container sub_wrap", Content: LibraryNewViewContent },
	{ section: "total_search", slug: "index", title: "통합검색", menuIndex: null, styles: ["/pub/css/styles_sub.css","/pub/css/styles_board_public.css","/pub/css/styles_total_search.css"], behavior: "total-search-tabs", mainClassName: "container sub_wrap", Content: TotalSearchIndexContent },
	{ section: "terms", slug: "policy", title: "이용약관", menuIndex: null, styles: ["/pub/css/styles_sub.css","/pub/css/styles_terms.css"], mainClassName: "container terms_wrap", Content: TermsPolicyContent },
	{ section: "terms", slug: "privacy", title: "개인정보처리방침", menuIndex: null, styles: ["/pub/css/styles_sub.css","/pub/css/styles_terms.css"], mainClassName: "container terms_wrap", Content: TermsPrivacyContent },
	{ section: "terms", slug: "no_email", title: "이메일 무단수집거부", menuIndex: null, styles: ["/pub/css/styles_sub.css","/pub/css/styles_terms.css"], mainClassName: "container terms_wrap", Content: TermsNoEmailContent },
	{ section: "terms", slug: "cctv", title: "영상정보처리기기 운영방침", menuIndex: null, styles: ["/pub/css/styles_sub.css","/pub/css/styles_terms.css"], mainClassName: "container terms_wrap", Content: TermsCctvContent },
]

const PAGE_BY_ROUTE = new Map(PAGE_DEFINITIONS.map((page) => [`${page.section}/${page.slug}`, page]))

export function getPageDefinition(section: string, slug: string): PageDefinition | null {
	return PAGE_BY_ROUTE.get(`${section}/${slug}`) || null
}
