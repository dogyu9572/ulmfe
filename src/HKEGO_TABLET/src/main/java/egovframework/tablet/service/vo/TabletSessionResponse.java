package egovframework.tablet.service.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabletSessionResponse {
	private String rsvtYmd;
	private TabletReservationVO reservation;
	@Builder.Default
	private List<TabletStudentVO> students = new ArrayList<>();
	@Builder.Default
	private List<TabletContentVO> contents = new ArrayList<>();
}
