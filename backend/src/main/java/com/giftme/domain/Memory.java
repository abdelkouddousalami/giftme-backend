package com.giftme.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A public "QR memory" page. publicCode is a cryptographically random, unguessable
 * identifier (see RandomCodeGenerator) - it, not the numeric id, is the only way
 * to reach this page from the public API.
 */
@Entity
@Table(name = "memories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(of = {"publicCode", "title", "active"})
public class Memory extends BaseEntity {

    @Column(nullable = false, unique = true, updatable = false, length = 32)
    private String publicCode;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String mainImage;

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "memory_gallery_images", joinColumns = @JoinColumn(name = "memory_id"))
    @Column(name = "image_url")
    @OrderColumn(name = "position")
    private List<String> gallery = new ArrayList<>();

    private String videoUrl;

    private String audioUrl;

    private String musicUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
