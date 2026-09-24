// 이달의 휴관일 응답(대상 월, 휴관 일자 목록, 안내 문구)
package egovframework.let.usr.service.vo;

import java.util.List;

/**
 * @param month 대상 월 (YYYY-MM)
 * @param days 휴관하는 날의 일자 목록 (1~31, 오름차순)
 * @param noticeText 정기휴관 요일 설정으로 만든 안내 문구
 */
public record PublicClosedDayMonthVO(String month, List<Integer> days, String noticeText) {
}
