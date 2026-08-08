package com.giftme.repository;

import com.giftme.domain.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
}
