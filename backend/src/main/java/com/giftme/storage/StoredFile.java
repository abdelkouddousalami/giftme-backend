package com.giftme.storage;

/** Result of a successful upload, independent of which storage backend handled it. */
public record StoredFile(String url, String fileName, long size, String contentType) {
}
