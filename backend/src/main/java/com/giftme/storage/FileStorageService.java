package com.giftme.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction so callers never depend on where bytes physically live.
 * LocalFileStorageService is the only implementation today; adding an
 * S3FileStorageService later (see README) requires no changes to any service
 * or controller that depends on this interface.
 */
public interface FileStorageService {

    StoredFile store(MultipartFile file, FileCategory category);
}
