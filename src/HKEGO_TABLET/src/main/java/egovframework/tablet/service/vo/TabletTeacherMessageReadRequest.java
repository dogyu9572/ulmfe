package egovframework.tablet.service.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class TabletTeacherMessageReadRequest {
	private List<Integer> studentSns = new ArrayList<>();
}
