package com.giftme.service;

import com.giftme.dto.upload.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {

    UploadResponse uploadImage(MultipartFile file);

    UploadResponse uploadVideo(MultipartFile file);

    UploadResponse uploadAudio(MultipartFile file);
}
