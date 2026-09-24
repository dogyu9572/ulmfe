package egovframework.com.config;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 관리자 API 의 page·size 파라미터를 컨트롤러에 닿기 전에 유효 범위로 보정한다.
 * page 음수·0 은 1로, size 는 1~{@value #MAX_SIZE} 로 맞춰 대량 조회로 인한 부하를 막는다.
 * ponytail: 목록 엔드포인트 25개에 같은 보정을 붙이는 대신 필터 한 곳에서 처리한다.
 */
@Component
public class ApiPagingParamFilter extends OncePerRequestFilter {
	private static final int MAX_SIZE = 1000;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return !request.getRequestURI().startsWith("/api/admin/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		String page = clamp(request.getParameter("page"), 1, Integer.MAX_VALUE);
		String size = clamp(request.getParameter("size"), 1, MAX_SIZE);
		if (page == null && size == null) {
			filterChain.doFilter(request, response);
			return;
		}
		filterChain.doFilter(new ClampedParamRequest(request, page, size), response);
	}

	/** 보정이 필요 없거나 숫자가 아니면 null 을 돌려준다(숫자 아님은 기존대로 400 처리에 맡긴다). */
	private String clamp(String raw, int min, int max) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		int value;
		try {
			value = Integer.parseInt(raw.trim());
		} catch (NumberFormatException e) {
			return null;
		}
		int clamped = Math.min(Math.max(value, min), max);
		return clamped == value ? null : String.valueOf(clamped);
	}

	private static class ClampedParamRequest extends HttpServletRequestWrapper {
		private final String page;
		private final String size;

		ClampedParamRequest(HttpServletRequest request, String page, String size) {
			super(request);
			this.page = page;
			this.size = size;
		}

		private String override(String name) {
			if ("page".equals(name)) {
				return page;
			}
			return "size".equals(name) ? size : null;
		}

		@Override
		public String getParameter(String name) {
			String value = override(name);
			return value != null ? value : super.getParameter(name);
		}

		@Override
		public String[] getParameterValues(String name) {
			String value = override(name);
			return value != null ? new String[] {value} : super.getParameterValues(name);
		}

		@Override
		public Map<String, String[]> getParameterMap() {
			Map<String, String[]> map = new java.util.LinkedHashMap<>(super.getParameterMap());
			if (page != null) {
				map.put("page", new String[] {page});
			}
			if (size != null) {
				map.put("size", new String[] {size});
			}
			return java.util.Collections.unmodifiableMap(map);
		}
	}
}
