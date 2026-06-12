package egovframework.let.adm.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.egovframe.rte.psl.dataaccess.EgovAbstractMapper;
import org.springframework.stereotype.Repository;

import egovframework.let.adm.service.vo.AdminInfoVO;

@Repository("adminDAO")
public class AdminDAO extends EgovAbstractMapper {
	private static final String NS = "egovframework.let.adm.service.impl.AdminDAO.";

	public AdminInfoVO findById(String id) {
		Map<String, Object> param = new HashMap<>();
		param.put("id", id);
		return selectOne(NS + "findById", param);
	}

	public int countAdminList(String status, String role) {
		Map<String, Object> param = new HashMap<>();
		param.put("status", status);
		param.put("role", role);
		Integer count = selectOne(NS + "countAdminList", param);
		return count == null ? 0 : count;
	}

	public List<AdminInfoVO> selectAdminList(String status, String role, int offset, int limit) {
		Map<String, Object> param = new HashMap<>();
		param.put("status", status);
		param.put("role", role);
		param.put("offset", offset);
		param.put("limit", limit);
		return selectList(NS + "selectAdminList", param);
	}

	public int insert(AdminInfoVO admin) {
		return insert(NS + "insert", admin);
	}

	public int update(AdminInfoVO admin) {
		return update(NS + "update", admin);
	}

	public int updatePassword(String id, String enpswd) {
		Map<String, Object> param = new HashMap<>();
		param.put("id", id);
		param.put("enpswd", enpswd);
		return update(NS + "updatePassword", param);
	}

	public int delete(String id) {
		Map<String, Object> param = new HashMap<>();
		param.put("id", id);
		return delete(NS + "delete", param);
	}
}
