package com.giftme.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(of = {"name", "slug", "price", "active"})
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String shortDescription;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private String category;

    @Column(nullable = false)
    private Integer stock;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    private String mainImage;

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "product_gallery_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @OrderColumn(name = "position")
    private List<String> galleryImages = new ArrayList<>();

    @Builder.Default
    @Column(nullable = false)
    private boolean customizationEnabled = false;
}
