package egovframework.com.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({
	EgovConfigAppAspect.class,
	EgovConfigAppCommon.class,
	EgovConfigAppIdGen.class,
	EgovConfigAppProperties.class,
	EgovConfigAppTransaction.class,
	EgovConfigAppWhitelist.class,
	EgovConfigAppMsg.class
})
public class EgovConfigApp {
}
