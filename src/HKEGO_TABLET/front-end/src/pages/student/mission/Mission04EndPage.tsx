import { MissionEndSticker } from './missionShared'

export const Mission04EndPage = () => <MissionEndSticker routeIndex={1} title="미래존 미션 수행 완료!" text={<>세계 기아 현황과 나의 소비 습관 사이의<br /><strong>연결고리를 발견했어요!</strong></>} image="/pub/images/icon_sticker_a02_large.svg" onClass={['i1', 'i2']} nextTitle="사회존" nextText="별관 1~2층 사회존 구역으로 이동하세요." nextButton="사회존으로 이동하기" nextPath="/student/mission05" />
