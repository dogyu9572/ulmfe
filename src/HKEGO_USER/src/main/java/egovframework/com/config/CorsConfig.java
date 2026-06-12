package egovframework.com.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableConfigurationProperties(AppCorsProperties.class)
public class CorsConfig {
	private final AppCorsProperties appCorsProperties;

	public CorsConfig(AppCorsProperties appCorsProperties) {
		this.appCorsProperties = appCorsProperties;
	}

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();
		for (String origin : appCorsProperties.getAllowedOrigins()) {
			if (origin != null && !origin.isBlank()) {
				config.addAllowedOrigin(origin.trim());
			}
		}
		config.addAllowedHeader("*");
		config.addAllowedMethod("*");
		config.addExposedHeader("X-XSRF-TOKEN");
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}
}
