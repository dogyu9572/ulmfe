package egovframework.tablet;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@MapperScan("egovframework.tablet.service.mapper")
@SpringBootApplication
public class TabletBootApplication extends SpringBootServletInitializer {
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(TabletBootApplication.class).bannerMode(Banner.Mode.OFF);
	}

	public static void main(String[] args) {
		SpringApplication springApplication = new SpringApplication(TabletBootApplication.class);
		springApplication.setBannerMode(Banner.Mode.OFF);
		springApplication.run(args);
	}
}
