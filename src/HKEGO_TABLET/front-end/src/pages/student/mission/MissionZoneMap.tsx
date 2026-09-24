// ESD 체험터 지도를 화면 우측 상단에 상시 노출하고 목적지 존만 음영으로 표시하는 컴포넌트
import { NEXT_ZONE_MAP } from '../../../state/missionPuzzleData'

/**
 * 지도 위 존 사각형의 위치를 화면 비율로 들고 있다.
 * `map_next_zone.svg`(viewBox 420x190)의 각 존 rect에서 환산한 값이라, 실물 지도가 오면 SVG와 이 표를 함께 교체한다.
 */
const ZONE_MAP_AREAS: Record<string, { left: number; top: number; width: number; height: number }> = {
	지구존: { left: 8.1, top: 18.9, width: 26.2, height: 29.5 },
	미래존: { left: 38.1, top: 18.9, width: 26.2, height: 29.5 },
	사회존: { left: 68.1, top: 18.9, width: 23.8, height: 29.5 },
	러닝도서관: { left: 8.1, top: 56.8, width: 56.2, height: 26.3 }
}

export const MissionZoneMap = ({ sceneNames, scene }: { sceneNames: string[]; scene: number }) => {
	// 스토리 화면(scene 0)에서는 첫 존이 목적지다. 완료 화면과 지도에 없는 「최종 미션」은 매칭되지 않아 음영이 사라진다
	const destination = scene === 0 ? sceneNames[1] : sceneNames[scene]
	const area = destination ? ZONE_MAP_AREAS[destination] : undefined

	return (
		<div className="mproto_zonemap">
			<div className="map">
				<img src={NEXT_ZONE_MAP} alt="ESD 체험터 지도" />
				{area && <span className="mark" style={{ left: `${area.left}%`, top: `${area.top}%`, width: `${area.width}%`, height: `${area.height}%` }} aria-hidden="true"></span>}
			</div>
			{area && <p className="txt">다음 목적지 <strong>{destination}</strong></p>}
			<p className="txt dummy">※ 더미 지도 — 실물 자산 도착 후 교체</p>
		</div>
	)
}
