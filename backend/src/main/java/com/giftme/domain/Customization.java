package com.giftme.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@Entity
@Table(name = "customizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(of = {"occasion", "qrMemoryEnabled"})
public class Customization extends BaseEntity {

    private String imageUrl;

    private String imagePosition;

    private Double imageScale;

    private Double imageRotation;

    @Column(columnDefinition = "TEXT")
    private String text;

    private String textStyle;

    private String font;

    private String textColor;

    private String occasion;

    private String recipientName;

    @Column(columnDefinition = "TEXT")
    private String giftMessage;

    private String videoUrl;

    private String audioUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean qrMemoryEnabled = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id")
    private Memory memory;
}
