package com.giftme.domain.enums;

/**
 * Only COD is supported today. Enum kept extensible for future gateways
 * (e.g. card, online wallet) without touching the Order schema.
 */
public enum PaymentMethod {
    COD
}
