package com.giftme.storage;

import com.giftme.common.exception.BadRequestException;
import com.giftme.common.exception.ErrorCode;
import com.giftme.config.GiftMeProperties;
import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Validates uploads against a category whitelist using content sniffing (Apache Tika
 * magic-byte detection), never the client-declared Content-Type or the file extension
 * alone - a renamed .exe with a ".jpg" extension and a spoofed Content-Type header
 * will still fail here because its actual bytes don't match a known image format.
 */
@Component
@RequiredArgsConstructor
public class FileValidator {

    private final Tika tika = new Tika();
    private final GiftMeProperties properties;

    private static final Map<FileCategory, Set<String>> ALLOWED_EXTENSIONS = Map.of(
            FileCategory.IMAGE, Set.of("jpg", "jpeg", "png", "webp", "gif"),
            FileCategory.VIDEO, Set.of("mp4", "mov", "webm"),
            FileCategory.AUDIO, Set.of("mp3", "wav", "ogg", "m4a")
    );

    private static final Map<FileCategory, Set<String>> ALLOWED_MIME_TYPES = Map.of(
            FileCategory.IMAGE, Set.of("image/jpeg", "image/png", "image/webp", "image/gif"),
            FileCategory.VIDEO, Set.of("video/mp4", "video/quicktime", "video/webm"),
            FileCategory.AUDIO, Set.of("audio/mpeg", "audio/wav", "audio/x-wav", "audio/vnd.wave",
                    "audio/ogg", "audio/mp4", "audio/x-m4a")
    );

    public record ValidatedFile(byte[] bytes, String extension, String detectedContentType) {
    }

    public ValidatedFile validate(MultipartFile file, FileCategory category) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(ErrorCode.FILE_VALIDATION_ERROR, "Uploaded file is empty");
        }

        long maxBytes = maxBytesFor(category);
        if (file.getSize() > maxBytes) {
            throw new BadRequestException(ErrorCode.FILE_VALIDATION_ERROR,
                    "File exceeds the maximum allowed size of " + (maxBytes / (1024 * 1024)) + "MB for " + category.name().toLowerCase());
        }

        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), ""));
        String extension = extensionOf(originalName);
        if (!ALLOWED_EXTENSIONS.get(category).contains(extension)) {
            throw new BadRequestException(ErrorCode.FILE_VALIDATION_ERROR,
                    "Unsupported file extension '." + extension + "' for " + category.name().toLowerCase());
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException(ErrorCode.FILE_VALIDATION_ERROR, "Unable to read uploaded file");
        }

        String detectedType = tika.detect(bytes);
        if (!ALLOWED_MIME_TYPES.get(category).contains(detectedType)) {
            throw new BadRequestException(ErrorCode.FILE_VALIDATION_ERROR,
                    "File content does not match a supported " + category.name().toLowerCase()
                            + " format (detected: " + detectedType + ")");
        }

        return new ValidatedFile(bytes, extension, detectedType);
    }

    private long maxBytesFor(FileCategory category) {
        return switch (category) {
            case IMAGE -> properties.storage().limits().imageMaxBytes();
            case VIDEO -> properties.storage().limits().videoMaxBytes();
            case AUDIO -> properties.storage().limits().audioMaxBytes();
        };
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) {
            throw new BadRequestException(ErrorCode.FILE_VALIDATION_ERROR, "File name has no extension");
        }
        return filename.substring(dot + 1).toLowerCase();
    }
}
