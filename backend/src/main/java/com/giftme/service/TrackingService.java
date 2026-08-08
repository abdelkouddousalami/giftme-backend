package com.giftme.service;

import com.giftme.dto.tracking.TrackingResponse;

public interface TrackingService {

    TrackingResponse getByTrackingCode(String trackingCode);
}
