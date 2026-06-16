package egovframework.com.security;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Set;

import org.springframework.web.multipart.MultipartFile;

public final class UploadFileValidator {
	private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
		".svg", ".html", ".htm", ".xhtml", ".xml", ".js", ".mjs", ".php", ".jsp", ".asp", ".aspx",
		".exe", ".bat", ".cmd", ".sh", ".ps1", ".jar", ".war", ".class"
	);

	private static final Set<String> IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

	private static final Set<String> GENERAL_ATTACHMENT_EXTENSIONS = Set.of(
		".jpg", ".jpeg", ".png", ".gif", ".webp",
		".pdf", ".xls", ".xlsx", ".doc", ".docx", ".hwp", ".hwpx",
		".ppt", ".pptx", ".zip", ".txt", ".csv", ".ico"
	);

	private UploadFileValidator() {
	}

	public static void validateImage(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		String filename = file.getOriginalFilename();
		String ext = normalizeExtension(filename);
		rejectDangerousExtension(ext);
		if (!IMAGE_EXTENSIONS.contains(ext)) {
			throw new RuntimeException("허용되지 않는 이미지 형식입니다.");
		}
		String contentType = file.getContentType();
		if (contentType != null) {
			String lower = contentType.toLowerCase(Locale.ROOT);
			if (lower.contains("svg") || lower.contains("html") || lower.contains("javascript")) {
				throw new RuntimeException("허용되지 않는 파일 형식입니다.");
			}
		}
		validateImageMagicBytes(file, ext);
	}

	/** 게시판·공통 첨부 (이미지·PDF·오피스 문서) */
	public static void validateGeneralAttachment(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		String filename = file.getOriginalFilename();
		String ext = normalizeExtension(filename);
		rejectDangerousExtension(ext);
		if (!GENERAL_ATTACHMENT_EXTENSIONS.contains(ext)) {
			throw new RuntimeException("허용되지 않는 첨부 파일 형식입니다.");
		}
		if (IMAGE_EXTENSIONS.contains(ext)) {
			validateImageMagicBytes(file, ext);
			return;
		}
		if (".pdf".equals(ext)) {
			validatePdfMagicBytes(file);
			return;
		}
		if (".ico".equals(ext)) {
			validateIcoMagicBytes(file);
		}
	}

	public static void validateAttachment(MultipartFile file, boolean allowPdf) {
		if (file == null || file.isEmpty()) {
			throw new RuntimeException("업로드할 파일이 없습니다.");
		}
		String filename = file.getOriginalFilename();
		String ext = normalizeExtension(filename);
		rejectDangerousExtension(ext);
		if (allowPdf && ".pdf".equals(ext)) {
			validatePdfMagicBytes(file);
			return;
		}
		if (IMAGE_EXTENSIONS.contains(ext)) {
			validateImageMagicBytes(file, ext);
			return;
		}
		throw new RuntimeException("허용되지 않는 첨부 파일 형식입니다.");
	}

	private static void rejectDangerousExtension(String ext) {
		if (ext.isEmpty() || BLOCKED_EXTENSIONS.contains(ext)) {
			throw new RuntimeException("허용되지 않는 파일 확장자입니다.");
		}
	}

	private static String normalizeExtension(String filename) {
		if (filename == null || !filename.contains(".")) {
			return "";
		}
		return filename.substring(filename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
	}

	private static void validateImageMagicBytes(MultipartFile file, String ext) {
		byte[] header = readHeader(file, 12);
		if (header.length < 3) {
			throw new RuntimeException("파일 내용을 확인할 수 없습니다.");
		}
		if (matches(header, new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
			return;
		}
		if (matches(header, new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47})) {
			return;
		}
		if (startsWithAscii(header, "GIF87a") || startsWithAscii(header, "GIF89a")) {
			return;
		}
		if (startsWithAscii(header, "RIFF") && header.length >= 12 && header[8] == 'W' && header[9] == 'E'
			&& header[10] == 'B' && header[11] == 'P') {
			return;
		}
		throw new RuntimeException("이미지 파일 형식이 올바르지 않습니다.");
	}

	private static void validatePdfMagicBytes(MultipartFile file) {
		byte[] header = readHeader(file, 5);
		if (!startsWithAscii(header, "%PDF-")) {
			throw new RuntimeException("PDF 파일 형식이 올바르지 않습니다.");
		}
	}

	private static void validateIcoMagicBytes(MultipartFile file) {
		byte[] header = readHeader(file, 4);
		if (header.length < 4 || header[0] != 0 || header[1] != 0 || header[2] != 1 || header[3] != 0) {
			throw new RuntimeException("ICO 파일 형식이 올바르지 않습니다.");
		}
	}

	private static byte[] readHeader(MultipartFile file, int size) {
		try (InputStream in = file.getInputStream()) {
			return in.readNBytes(size);
		} catch (IOException e) {
			throw new RuntimeException("파일 검증 중 오류가 발생했습니다.");
		}
	}

	private static boolean matches(byte[] data, byte[] prefix) {
		if (data.length < prefix.length) {
			return false;
		}
		for (int i = 0; i < prefix.length; i++) {
			if (data[i] != prefix[i]) {
				return false;
			}
		}
		return true;
	}

	private static boolean startsWithAscii(byte[] data, String text) {
		byte[] bytes = text.getBytes(java.nio.charset.StandardCharsets.US_ASCII);
		return matches(data, bytes);
	}
}
