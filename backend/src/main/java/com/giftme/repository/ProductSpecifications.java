package com.giftme.repository;

import com.giftme.domain.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> withFilters(String category, Boolean active, String search) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (StringUtils.hasText(category)) {
                predicates = cb.and(predicates, cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
            }
            if (active != null) {
                predicates = cb.and(predicates, cb.equal(root.get("active"), active));
            }
            if (StringUtils.hasText(search)) {
                String like = "%" + search.toLowerCase() + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("shortDescription")), like)
                ));
            }
            return predicates;
        };
    }
}
