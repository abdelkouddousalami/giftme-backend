package com.giftme.common.util;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Generates human-facing codes backed by SecureRandom - never java.util.Random -
 * since tracking codes and memory public codes must be unguessable (business rule #14).
 * Human-read codes exclude visually ambiguous characters (0/O, 1/I/L).
 */
public final class RandomCodeGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String HUMAN_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final String URL_SAFE_ALPHABET =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private RandomCodeGenerator() {
    }

    /** e.g. GM-8X4K2Q */
    public static String trackingCode() {
        return "GM-" + randomString(HUMAN_ALPHABET, 6);
    }

    /** e.g. ORD-20260808-7Q2XK */
    public static String orderNumber() {
        return "ORD-" + LocalDate.now().format(DATE_FMT) + "-" + randomString(HUMAN_ALPHABET, 5);
    }

    /** Long, high-entropy, URL-safe code for public memory pages - not meant to be typed by hand. */
    public static String memoryPublicCode() {
        return randomString(URL_SAFE_ALPHABET, 24);
    }

    private static String randomString(String alphabet, int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
        }
        return sb.toString();
    }
}
