package com.giftme.service.impl;

import com.giftme.dto.upload.UploadResponse;
import com.giftme.service.UploadService;
import com.giftme.storage.FileCategory;
import com.giftme.storage.FileStorageService;
import com.giftme.storage.StoredFile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements UploadService {

    private final FileStorageService fileStorageService;

    @Override
    public UploadResponse uploadImage(MultipartFile file) {
        return toResponse(fileStorageService.store(file, FileCategory.IMAGE));
    }

    @Override
    public UploadResponse uploadVideo(MultipartFile file) {
        return toResponse(fileStorageService.store(file, FileCategory.VIDEO));
    }

    @Override
    public UploadResponse uploadAudio(MultipartFile file) {
        return toResponse(fileStorageService.store(file, FileCategory.AUDIO));
    }

    private UploadResponse toResponse(StoredFile stored) {
        return new UploadResponse(stored.url(), stored.fileName(), stored.size(), stored.contentType());
    }
}
