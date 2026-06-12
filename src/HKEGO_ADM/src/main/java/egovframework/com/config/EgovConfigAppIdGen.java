package egovframework.com.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import egovframework.com.cmm.util.EgovIdGnrBuilder;
import org.egovframe.rte.fdl.idgnr.impl.EgovTableIdGnrServiceImpl;
import org.egovframe.rte.fdl.idgnr.impl.strategy.EgovIdGnrStrategyImpl;

@Configuration
public class EgovConfigAppIdGen {

	private final DataSource dataSource;

	public EgovConfigAppIdGen(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	@Bean(destroyMethod = "destroy")
	public EgovTableIdGnrServiceImpl egovFileIdGnrService() {
		EgovTableIdGnrServiceImpl service = new EgovTableIdGnrServiceImpl();
		service.setDataSource(dataSource);
		EgovIdGnrStrategyImpl strategy = new EgovIdGnrStrategyImpl();
		strategy.setPrefix("FILE_");
		strategy.setCipers(15);
		strategy.setFillChar('0');
		service.setStrategy(strategy);
		service.setBlockSize(10);
		service.setTable("IDS");
		service.setTableName("FILE_ID");
		return service;
	}

	@Bean(destroyMethod = "destroy")
	public EgovTableIdGnrServiceImpl egovBBSMstrIdGnrService() {
		return new EgovIdGnrBuilder().setDataSource(dataSource).setEgovIdGnrStrategyImpl(new EgovIdGnrStrategyImpl())
			.setBlockSize(10).setTable("IDS").setTableName("BBS_ID").setPreFix("BBSMSTR_").setCipers(12).setFillChar('0').build();
	}
}
