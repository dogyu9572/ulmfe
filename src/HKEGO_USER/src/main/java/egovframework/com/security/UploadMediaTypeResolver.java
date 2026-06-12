package egovframework.com.security;

/**
 * 업로드 파일 Content-Type (Windows probeContentType이 PDF를 text/plain으로 반환하는 경우 대비)
 */
public final class UploadMediaTypeResolver {

	private UploadMediaTypeResolver() {
	}

	public static String resolve(String multipartContentType, String originalFilename, String ext) {
		String fromName = fromFilename(originalFilename);
		if (fromName != null) {
			return fromName;
		}
		String fromExt = fromExtension(ext);
		if (fromExt != null) {
			return fromExt;
		}
		if (multipartContentType != null && !multipartContentType.isBlank()) {
			String ct = multipartContentType.trim();
			if (!"text/plain".equalsIgnoreCase(ct) || !looksBinaryExtension(originalFilename, ext)) {
				return ct;
			}
		}
		return "application/octet-stream";
	}

	public static String resolveForPath(String filePath, String storedContentType) {
		String fromPath = fromFilename(filePath);
		if (fromPath != null) {
			return fromPath;
		}
		if (storedContentType != null && !storedContentType.isBlank()) {
			String ct = storedContentType.trim();
			if (!"text/plain".equalsIgnoreCase(ct) || !looksBinaryExtension(filePath, null)) {
				return ct;
			}
		}
		return "application/octet-stream";
	}

	private static boolean looksBinaryExtension(String filename, String ext) {
		String e = ext;
		if (e == null || e.isBlank()) {
			e = extensionOf(filename);
		}
		if (e == null) {
			return false;
		}
		String lower = e.toLowerCase();
		return lower.equals(".pdf") || lower.equals(".zip") || lower.equals(".doc") || lower.equals(".docx")
				|| lower.equals(".xls") || lower.equals(".xlsx") || lower.equals(".hwp") || lower.equals(".hwpx")
				|| lower.equals(".ppt") || lower.equals(".pptx");
	}

	private static String fromFilename(String filename) {
		if (filename == null || filename.isBlank()) {
			return null;
		}
		return fromExtension(extensionOf(filename));
	}

	private static String extensionOf(String filename) {
		if (filename == null) {
			return null;
		}
		String name = filename;
		int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
		if (slash >= 0) {
			name = name.substring(slash + 1);
		}
		int dot = name.lastIndexOf('.');
		if (dot < 0 || dot == name.length() - 1) {
			return null;
		}
		return name.substring(dot);
	}

	private static String fromExtension(String ext) {
		if (ext == null || ext.isBlank()) {
			return null;
		}
		String e = ext.trim().toLowerCase();
		if (!e.startsWith(".")) {
			e = "." + e;
		}
		return switch (e) {
			case ".pdf" -> "application/pdf";
			case ".doc" -> "application/msword";
			case ".docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
			case ".xls" -> "application/vnd.ms-excel";
			case ".xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			case ".ppt" -> "application/vnd.ms-powerpoint";
			case ".pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
			case ".hwp" -> "application/x-hwp";
			case ".hwpx" -> "application/hwp+zip";
			case ".zip" -> "application/zip";
			case ".txt" -> "text/plain; charset=UTF-8";
			case ".csv" -> "text/csv; charset=UTF-8";
			case ".jpg", ".jpeg" -> "image/jpeg";
			case ".png" -> "image/png";
			case ".gif" -> "image/gif";
			case ".webp" -> "image/webp";
			default -> null;
		};
	}
}
