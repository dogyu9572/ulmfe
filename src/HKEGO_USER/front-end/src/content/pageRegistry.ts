import type { ComponentType } from 'react'
import { SITE_MENUS } from '@/components/siteNavigation'
import { withBasePath } from '@/lib/basePath'
import { hoursText, OPENING_HOURS } from '@/lib/siteMeta'
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
import ProgramListContent from './pages/program/list'
import ProgramReserveContent from './pages/program/reserve'
// 교육프로그램 소개를 관리자에서 등록하는 목록 페이지(/program/list)로 통합하면서 개별 소개 페이지를 내렸다.
// 파일은 되살릴 수 있도록 남겨 둔다. 기존 주소는 next.config.ts 에서 /program/list 로 301 이동한다.
// import ProgramEsdPblContent from './pages/program/esd_pbl'
// import ProgramElementaryContent from './pages/program/elementary'
// import ProgramMissionContent from './pages/program/mission'
// import ProgramSpecialContent from './pages/program/special'
// import ProgramElementary1Content from './pages/program/elementary1'
// import ProgramElementary2Content from './pages/program/elementary2'
// import ProgramElementary3Content from './pages/program/elementary3'
// import ProgramElementary4Content from './pages/program/elementary4'
// import ProgramElementary5Content from './pages/program/elementary5'
// import ProgramMission1Content from './pages/program/mission1'
// import ProgramMission2Content from './pages/program/mission2'
// import ProgramMission3Content from './pages/program/mission3'
// import ProgramBiggameContent from './pages/program/biggame'
// import ProgramFreeContent from './pages/program/free'
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
import NewsFaqContent from './pages/news/faq'
import NewsGalleryContent from './pages/news/gallery'
// 1:1문의는 메뉴 폐지로 라우트에서 제외. 화면 코드는 pages/support/qna*.tsx 와 components/public-qna 에 남아 있다.
import LibraryInfoContent from './pages/library/info'
import LibrarySearchContent from './pages/library/search'
import LibrarySearchListContent from './pages/library/search_list'
import LibrarySearchViewContent from './pages/library/search_view'
import LibraryRecommendContent from './pages/library/recommend'
import LibraryRecommendViewContent from './pages/library/recommend_view'
// 새로 들어온 도서 메뉴는 자료실로 대체 (복구 가능성 있어 주석 유지)
import LibraryNewContent from './pages/library/new'
import LibraryNewViewContent from './pages/library/new_view'
import LibraryArchiveContent from './pages/library/archive'
import LibraryArchiveViewContent from './pages/library/archive_view'
import TotalSearchIndexContent from './pages/total_search/index'
import TermsPolicyContent from './pages/terms/policy'
import TermsPrivacyContent from './pages/terms/privacy'
import TermsNoEmailContent from './pages/terms/no_email'
import TermsCctvContent from './pages/terms/cctv'

export type PageBehaviorName = 'faq' | 'history' | 'library-month' | 'library-sliders' | 'location-map' | 'program-height' | 'program-slider' | 'popup' | 'total-search-tabs'

export type PageContentProps = Record<string, never>

export type PageDefinition = {
	section: string
	slug: string
	title: string
	/** 소속 대메뉴. section 에서 파생되므로 각 항목이 직접 적지 않는다. */
	menuIndex: number | null
	/** 사이드바(SubpageAside)에 찍히는 대메뉴 소개 문구. 같은 섹션이면 같은 값을 쓴다. */
	description?: string
	/**
	 * 검색엔진·답변엔진에 나가는 meta description. 페이지마다 내용이 달라야 하므로
	 * 섹션 공통인 description 과 분리했다. 비워 두면 description 으로 되돌아간다.
	 */
	metaDescription?: string
	styles: string[]
	behavior?: PageBehaviorName
	activeHref?: string
	mainClassName: string
	Content: ComponentType<PageContentProps>
}

/** 대메뉴 순서가 바뀌어도 SITE_MENUS 만 고치면 되도록, 섹션으로 대메뉴를 찾는다. */
const MENU_INDEX_BY_SECTION = new Map(SITE_MENUS.map((menu, index) => [menu.section, index]))

/** 운영시간을 문장에 직접 적으면 값이 바뀔 때 어긋나므로 상수에서 만들어 쓴다. */
const PROGRAM_RESERVE_META = `울산광역시미래교육관 이용 방법과 교육프로그램 예약 절차를 안내합니다. 운영시간은 ${OPENING_HOURS.weekday.label} ${hoursText(OPENING_HOURS.weekday)}, ${OPENING_HOURS.weekend.label} ${hoursText(OPENING_HOURS.weekend)} 이며 이용요금은 무료입니다.`

const PAGE_SOURCES: Array<Omit<PageDefinition, 'menuIndex'>> = [
	{ section: "about", slug: "greeting", title: "인사말", description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", metaDescription: "울산광역시미래교육관 인사말입니다. UN 지속가능발전목표(SDGs)를 바탕으로 학생이 사회·환경·경제 문제를 스스로 탐구하는 지속가능발전교육(ESD) 체험 기관으로서 드리는 다짐을 전합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_about.css')], mainClassName: "container sub_wrap", Content: AboutGreetingContent },
	{ section: "about", slug: "vision", title: "미션 및 비전", description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", metaDescription: "울산광역시미래교육관의 미션과 비전입니다. 이야기형·확장형·통합형 콘텐츠를 비롯해, 지속가능성에 대한 질문과 탐색이 실천으로 이어지도록 설계한 전시 운영 방향을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_about.css')], mainClassName: "container sub_wrap", Content: AboutVisionContent },
	{ section: "about", slug: "history", title: "연혁", description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", metaDescription: "울산광역시미래교육관이 걸어온 길을 연도별로 정리했습니다. 인류가 직면한 문제를 학교 교육과정과 연계해 학생 주도 프로젝트 학습으로 체험하는 미래형 융합 교육 공간이 되기까지의 과정을 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_about.css')], behavior: "history", mainClassName: "container sub_wrap", Content: AboutHistoryContent },
	{ section: "about", slug: "organization", title: "조직도", description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", metaDescription: "울산광역시미래교육관의 조직도입니다. 기획운영팀과 전시체험팀의 직위별 담당업무와 전화번호를 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_about.css')], mainClassName: "container sub_wrap", Content: AboutOrganizationContent },
	{ section: "about", slug: "ci", title: "CI", description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", metaDescription: "울산광역시미래교육관의 CI를 소개합니다. 기관의 정체성과 비전을 담은 심벌마크와 시그니처, 캐릭터 양식을 내려받으실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_about.css')], mainClassName: "container sub_wrap", Content: AboutCiContent },
	{ section: "about", slug: "location", title: "오시는 길", description: "울산광역시미래교육관 홈페이지를 방문해주신 여러분을 진심으로 환영합니다.", metaDescription: "울산광역시미래교육관 오시는 길입니다. 소재지는 울산광역시 북구 무룡로 1119-6이며, 공항·고속도로·KTX·터미널에서 찾아오는 경로와 지도를 안내합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_about.css')], behavior: "location-map", mainClassName: "container sub_wrap", Content: AboutLocationContent },
	{ section: "exhibit", slug: "floor_1f", title: "1F [질문]", description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", metaDescription: "울산광역시미래교육관 1F [질문] 시설 안내입니다. 지속가능성에 대한 첫 질문이 시작되는 이야기터와 ESD 체험터, ESD 실내놀이터를 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_exhibit.css')], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitFloor1fContent },
	{ section: "exhibit", slug: "floor_2f", title: "2F [탐구]", description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", metaDescription: "울산광역시미래교육관 2F [탐구] 시설 안내입니다. 문제를 직접 탐구하고 아이디어를 만들어가는 디지털창작실, 메이커실, 미디어실, 아이디어실, 조리체험실을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_exhibit.css')], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitFloor2fContent },
	{ section: "exhibit", slug: "floor_3f", title: "3F [모험]", description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", metaDescription: "울산광역시미래교육관 3F [모험] 시설 안내입니다. 팀 단위로 퀘스트를 수행하며 협력·사고·실천 역량을 기르는 ESD 모험터를 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_exhibit.css')], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitFloor3fContent },
	{ section: "exhibit", slug: "annex", title: "별관 [생각]", description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", metaDescription: "울산광역시미래교육관 별관 [생각] 시설 안내입니다. 지속가능발전을 주제로 깊이 읽고 탐색하는 도서관과 강동초 기록실, 회의실, 서가·열람실을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_exhibit.css')], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitAnnexContent },
	{ section: "exhibit", slug: "outdoor", title: "야외 [놀이]", description: "지속가능한 미래를 직접 체험하는 울산광역시미래교육관의 공간을 안내합니다.", metaDescription: "울산광역시미래교육관 야외 [놀이] 시설 안내입니다. 곤충관찰원과 온실재배원, 옥상 전망대, 바다놀이터, 모래놀이터에서 자연과 함께 배우는 공간을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_exhibit.css')], behavior: "popup", mainClassName: "container sub_wrap", Content: ExhibitOutdoorContent },
	// { section: "program", slug: "esd_pbl", title: "ESD/PBL 소개", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-height", mainClassName: "container sub_wrap pb0", Content: ProgramEsdPblContent },
	// { section: "program", slug: "elementary", title: "사건탐구 프로그램(초5)", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-height", mainClassName: "container sub_wrap pb0", Content: ProgramElementaryContent },
	// { section: "program", slug: "mission", title: "미션 프로그램(중1)", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-height", mainClassName: "container sub_wrap pb0", Content: ProgramMissionContent },
	// { section: "program", slug: "special", title: "방학/주말 특별프로그램", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], mainClassName: "container sub_wrap pb0", Content: ProgramSpecialContent },
	{ section: "program", slug: "list", title: "교육프로그램", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", metaDescription: "울산광역시미래교육관에서 운영하는 교육프로그램 목록입니다. 분류별로 프로그램의 내용과 운영 장소, 시기, 인원을 확인하고 참여를 신청하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css'),withBasePath('/pub/css/styles_program_list.css')], mainClassName: "container sub_wrap pb0", Content: ProgramListContent },
	{ section: "program", slug: "reserve", title: "예약 안내", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", metaDescription: PROGRAM_RESERVE_META, styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], mainClassName: "container sub_wrap pb0", Content: ProgramReserveContent },
	// { section: "program", slug: "elementary1", title: "사건탐구 프로그램(초5)", activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary1Content },
	// { section: "program", slug: "elementary2", title: "사건탐구 프로그램(초5)", activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary2Content },
	// { section: "program", slug: "elementary3", title: "사건탐구 프로그램(초5)", activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary3Content },
	// { section: "program", slug: "elementary4", title: "사건탐구 프로그램(초5)", activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary4Content },
	// { section: "program", slug: "elementary5", title: "사건탐구 프로그램(초5)", activeHref: "/program/elementary", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramElementary5Content },
	// { section: "program", slug: "mission1", title: "미션 프로그램(중1)", activeHref: "/program/mission", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramMission1Content },
	// { section: "program", slug: "mission2", title: "미션 프로그램(중1)", activeHref: "/program/mission", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramMission2Content },
	// { section: "program", slug: "mission3", title: "미션 프로그램(중1)", activeHref: "/program/mission", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "program-slider", mainClassName: "container sub_wrap", Content: ProgramMission3Content },
	// { section: "program", slug: "biggame", title: "빅게임 프로그램", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "popup", mainClassName: "container sub_wrap pb0", Content: ProgramBiggameContent },
	// { section: "program", slug: "free", title: "자유 체험", description: "질문하고, 탐구하고, 만드는 울산광역시미래교육관의 교육 프로그램을 소개합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_program.css')], behavior: "popup", mainClassName: "container sub_wrap pb0", Content: ProgramFreeContent },
	{ section: "archive", slug: "elementary", title: "ESD 체험터", description: "방문 전·중·후 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", metaDescription: "ESD 체험터 학습지원 자료실입니다. 미래존, 지구존, 사회존별 활동지와 안내 자료를 내려받으실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_list.css')], mainClassName: "container sub_wrap", Content: ArchiveElementaryContent },
	{ section: "archive", slug: "elementary_view", title: "ESD 체험터", activeHref: "/archive/elementary", description: "방문 전·중·후 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_view.css')], mainClassName: "container sub_wrap", Content: ArchiveElementaryViewContent },
	{ section: "archive", slug: "mission", title: "학교단위 프로그램", description: "방문 전·중·후 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", metaDescription: "학교단위 프로그램 학습지원 자료실입니다. 학습 단계별 활동지와 안내 자료를 내려받으실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_list.css')], mainClassName: "container sub_wrap", Content: ArchiveMissionContent },
	{ section: "archive", slug: "mission_view", title: "학교단위 프로그램", activeHref: "/archive/mission", description: "방문 전·중·후 학습의 모든 단계를 함께합니다. 교육프로그램에 필요한 자료를 한곳에서 확인하세요.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_view.css')], mainClassName: "container sub_wrap", Content: ArchiveMissionViewContent },
	{ section: "news", slug: "notice", title: "공지사항", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", metaDescription: "울산광역시미래교육관의 공지사항입니다. 휴관일과 운영 변경, 프로그램 모집 등 이용에 앞서 확인해야 할 안내를 전합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_list.css')], mainClassName: "container sub_wrap", Content: NewsNoticeContent },
	{ section: "news", slug: "notice_view", title: "공지사항", activeHref: "/news/notice", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_view.css')], mainClassName: "container sub_wrap", Content: NewsNoticeViewContent },
	{ section: "news", slug: "exhibit", title: "기획전", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", metaDescription: "울산광역시미래교육관에서 진행하는 기획전을 소개합니다. 전시 주제와 운영 기간, 참여 방법을 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_gallery_list.css')], mainClassName: "container sub_wrap", Content: NewsExhibitContent },
	{ section: "news", slug: "exhibit_view", title: "기획전", activeHref: "/news/exhibit", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_view.css')], mainClassName: "container sub_wrap", Content: NewsExhibitViewContent },
	{ section: "news", slug: "event", title: "이벤트", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", metaDescription: "울산광역시미래교육관에서 진행하는 이벤트를 소개합니다. 참여 대상과 진행 기간, 신청 방법을 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_gallery_list.css')], mainClassName: "container sub_wrap", Content: NewsEventContent },
	{ section: "news", slug: "event_view", title: "이벤트", activeHref: "/news/event", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_view.css')], mainClassName: "container sub_wrap", Content: NewsEventViewContent },
	{ section: "news", slug: "faq", title: "FAQ", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", metaDescription: "울산광역시미래교육관 이용에 대해 자주 묻는 질문과 답변을 모았습니다. 관람과 예약, 시설 이용에 관한 궁금증을 빠르게 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_support.css')], mainClassName: "container sub_wrap", Content: NewsFaqContent },
	{ section: "news", slug: "gallery", title: "갤러리", description: "울산광역시미래교육관의 새로운 소식을 전합니다.", metaDescription: "울산광역시미래교육관의 활동 사진을 모은 갤러리입니다. 교육프로그램과 행사가 진행된 현장의 모습을 살펴보실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_gallery_list.css')], behavior: "popup", mainClassName: "container sub_wrap", Content: NewsGalleryContent },
	{ section: "library", slug: "info", title: "도서관 안내", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", metaDescription: "울산광역시미래교육관 도서관 안내입니다. 학생과 시민 누구나 자유롭게 지식과 정보에 접근할 수 있도록 운영하며, 이용 방법과 운영 정보를 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibraryInfoContent },
	{ section: "library", slug: "search", title: "자료검색", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", metaDescription: "울산광역시미래교육관 도서관 자료검색입니다. 제목과 저자로 소장 도서를 찾고, 사서가 추천한 도서를 함께 살펴보실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_library.css')], behavior: "library-sliders", mainClassName: "container sub_wrap", Content: LibrarySearchContent },
	{ section: "library", slug: "search_list", title: "자료검색", activeHref: "/library/search", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibrarySearchListContent },
	{ section: "library", slug: "search_view", title: "자료검색", activeHref: "/library/search", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibrarySearchViewContent },
	{ section: "library", slug: "recommend", title: "사서 추천도서", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", metaDescription: "울산광역시미래교육관 도서관 사서 추천도서입니다. 지속가능발전을 주제로 사서가 직접 고른 책을 만나보실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibraryRecommendContent },
	{ section: "library", slug: "recommend_view", title: "사서 추천도서", activeHref: "/library/recommend", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibraryRecommendViewContent },
	// 새로 들어온 도서 메뉴는 자료실로 대체 (복구 가능성 있어 주석 유지)
	{ section: "library", slug: "new", title: "새로 들어온 도서", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", metaDescription: "울산광역시미래교육관 도서관에 새로 들어온 도서입니다. 최근 들어온 자료를 가장 먼저 확인하실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibraryNewContent },
	{ section: "library", slug: "new_view", title: "새로 들어온 도서", activeHref: "/library/new", description: "지속가능발전을 주제로 깊이 읽고 탐색하는 공간입니다. 프로젝트 수업 전후, 생각을 넓혀줄 자료를 찾아보세요.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_library.css')], mainClassName: "container sub_wrap", Content: LibraryNewViewContent },
	{ section: "library", slug: "archive", title: "자료실", description: "독서퀴즈, 독후활동지, 도서관 행사 안내물을 제공합니다.", metaDescription: "울산광역시미래교육관 도서관 자료실입니다. 독서퀴즈와 독후활동지, 도서관 행사 안내물을 내려받으실 수 있습니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_list.css')], mainClassName: "container sub_wrap", Content: LibraryArchiveContent },
	{ section: "library", slug: "archive_view", title: "자료실", activeHref: "/library/archive", description: "독서퀴즈, 독후활동지, 도서관 행사 안내물을 제공합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_board_view.css')], mainClassName: "container sub_wrap", Content: LibraryArchiveViewContent },
	{ section: "total_search", slug: "index", title: "통합검색", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_board_public.css'),withBasePath('/pub/css/styles_total_search.css')], behavior: "total-search-tabs", mainClassName: "container sub_wrap", Content: TotalSearchIndexContent },
	{ section: "terms", slug: "policy", title: "이용약관", metaDescription: "울산광역시미래교육관 누리집 이용약관입니다. 서비스 이용 조건과 이용자 및 기관의 권리와 의무를 안내합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_terms.css')], mainClassName: "container terms_wrap", Content: TermsPolicyContent },
	{ section: "terms", slug: "privacy", title: "개인정보처리방침", metaDescription: "울산광역시미래교육관 개인정보처리방침입니다. 수집하는 개인정보 항목과 이용 목적, 보유 기간, 정보주체의 권리 행사 방법을 안내합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_terms.css')], mainClassName: "container terms_wrap", Content: TermsPrivacyContent },
	{ section: "terms", slug: "no_email", title: "이메일 무단수집거부", metaDescription: "울산광역시미래교육관 누리집에 게시된 이메일 주소를 전자우편 수집 프로그램으로 무단 수집하는 행위를 거부합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_terms.css')], mainClassName: "container terms_wrap", Content: TermsNoEmailContent },
	{ section: "terms", slug: "cctv", title: "영상정보처리기기 운영방침", metaDescription: "울산광역시미래교육관 영상정보처리기기 운영·관리 방침입니다. 설치 목적과 촬영 범위, 보관 기간, 열람 청구 방법을 안내합니다.", styles: [withBasePath('/pub/css/styles_sub.css'),withBasePath('/pub/css/styles_terms.css')], mainClassName: "container terms_wrap", Content: TermsCctvContent },
]

export const PAGE_DEFINITIONS: PageDefinition[] = PAGE_SOURCES.map((page) => ({
	...page,
	menuIndex: MENU_INDEX_BY_SECTION.get(page.section) ?? null
}))

const PAGE_BY_ROUTE = new Map(PAGE_DEFINITIONS.map((page) => [`${page.section}/${page.slug}`, page]))

export function getPageDefinition(section: string, slug: string): PageDefinition | null {
	return PAGE_BY_ROUTE.get(`${section}/${slug}`) || null
}
