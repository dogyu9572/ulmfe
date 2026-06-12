package egovframework.com.config;

import java.io.IOException;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

/**
 * application.yml DataSource + mapper 경로를 EgovAbstractMapper가 기대하는 sqlSession 빈으로 연결한다.
 */
@Configuration
public class EgovMyBatisBridgeConfig {
	@Bean(name = {"sqlSession", "egov.sqlSession"})
	public SqlSessionFactoryBean sqlSession(DataSource dataSource) throws IOException {
		SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
		factory.setDataSource(dataSource);

		org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
		configuration.setMapUnderscoreToCamelCase(true);
		configuration.setDefaultStatementTimeout(30);
		factory.setConfiguration(configuration);

		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		factory.setMapperLocations(resolver.getResources("classpath*:mapper/**/*.xml"));
		return factory;
	}

	@Bean
	public SqlSessionTemplate egovSqlSessionTemplate(@Qualifier("sqlSession") SqlSessionFactory sqlSession) {
		return new SqlSessionTemplate(sqlSession);
	}
}
