package com.giftme.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Guest-friendly customer profile. Deduplicated on phone (not email) because COD
 * shoppers reliably provide a phone number but may type a different or no email
 * on each order; phone is the durable identity key here. totalOrders/totalSpent
 * are intentionally NOT stored on this row - see CustomerService, which computes
 * them from the orders table at read time to avoid denormalized counters drifting
 * out of sync with reality (e.g. after a cancellation or manual DB fix).
 */
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(of = {"name", "phone"})
public class Customer extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    private String email;
}
