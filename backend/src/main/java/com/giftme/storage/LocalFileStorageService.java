package com.giftme.storage;

import com.giftme.config.GiftMeProperties;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class LocalFileStorageService implements FileStorageService {

    private final FileValidator fileValidator;
    private final GiftMeProperties properties;

    @Override
    public StoredFile store(MultipartFile file, FileCategory category) {
        FileValidator.ValidatedFile validated = fileValidator.validate(file, category);

        String subdir = subdirFor(category);
        String filename = UUID.randomUUID() + "." + validated.extension();

        Path basePath = Path.of(properties.storage().local().basePath()).toAbsolutePath().normalize();
        Path targetDir = basePath.resolve(subdir);

        try {
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(filename);
            Files.write(targetFile, validated.bytes());
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store uploaded file to local disk", e);
        }

        String publicUrl = properties.storage().publicBaseUrl() + "/" + subdir + "/" + filename;
        return new StoredFile(publicUrl, filename, validated.bytes().length, validated.detectedContentType());
    }

    private String subdirFor(FileCategory category) {
        return switch (category) {
            case IMAGE -> "images";
            case VIDEO -> "videos";
            case AUDIO -> "audio";
        };
    }
}
