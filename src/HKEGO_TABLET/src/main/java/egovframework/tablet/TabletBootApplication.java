package egovframework.tablet;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("egovframework.tablet.service.mapper")
@SpringBootApplication
public class TabletBootApplication {
	public static void main(String[] args) {
		SpringApplication springApplication = new SpringApplication(TabletBootApplication.class);
		springApplication.setBannerMode(Banner.Mode.OFF);
		springApplication.run(args);
	}
}
