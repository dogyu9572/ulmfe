package egovframework.let.usr.service.vo;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicLibraryBookVO {
	private Integer bookId;
	private String bookManagementNumber;
	private String title;
	private String imageUrl;
	private String authorName;
	private String publisherName;
	private String publicationYear;
	private String callNumber;
	private String locationName;
	private String description;
	private String recommendedYn;
	private String recommendationCategoryCode;
	private String recommendationCategoryName;
	private Integer recommendationSortSequence;
	private String newBookYear;
	private String newBookMonth;
	private LocalDate registeredDate;
	private Integer viewCount;

	@Builder.Default
	private List<PublicLibraryBookVO> relatedBooks = new ArrayList<>();
}
