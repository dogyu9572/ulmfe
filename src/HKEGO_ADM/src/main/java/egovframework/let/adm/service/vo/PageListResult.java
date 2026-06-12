package egovframework.let.adm.service.vo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class PageListResult {

	private PageListResult() {
	}

	public static Map<String, Object> of(List<?> list, int totalCount, int page, int size) {
		int safePage = Math.max(1, page);
		int safeSize = Math.max(1, size);
		int totalPages = totalCount == 0 ? 1 : (int) Math.ceil((double) totalCount / safeSize);

		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("totalCount", totalCount);
		result.put("page", safePage);
		result.put("size", safeSize);
		result.put("totalPages", totalPages);
		return result;
	}
}
