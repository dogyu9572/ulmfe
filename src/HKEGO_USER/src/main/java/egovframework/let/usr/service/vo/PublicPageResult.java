package egovframework.let.usr.service.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicPageResult<T> {
	private List<T> list;
	private int totalCount;
	private int page;
	private int size;
	private int totalPages;

	public static <T> PublicPageResult<T> of(List<T> list, int totalCount, int page, int size) {
		int safeSize = Math.max(1, size);
		return PublicPageResult.<T>builder()
			.list(list)
			.totalCount(totalCount)
			.page(Math.max(1, page))
			.size(safeSize)
			.totalPages(Math.max(1, (int) Math.ceil((double) totalCount / safeSize)))
			.build();
	}
}
