package com.giftme.common.response;

import java.util.List;
import java.util.function.Function;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;

    private PagedResponse(List<T> content, int page, int size, long totalElements, int totalPages,
                           boolean first, boolean last) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    public static <T> PagedResponse<T> of(Page<T> page) {
        return new PagedResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }

    public static <T, R> PagedResponse<R> of(Page<T> page, Function<T, R> mapper) {
        return new PagedResponse<>(page.getContent().stream().map(mapper).toList(), page.getNumber(),
                page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isFirst(), page.isLast());
    }
}
