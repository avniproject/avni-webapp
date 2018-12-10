package org.openchs.web;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;

import java.util.ArrayList;
import java.util.List;

public interface RestControllerResourceProcessor<T> {

    default Resource<T> process(Resource<T> t) {
        return t;
    }

    default PagedResources<Resource<T>> wrap(Page<T> page) {
        PagedResources.PageMetadata pageMetadata = new PagedResources.PageMetadata(page.getSize(), page.getNumber(), page.getTotalElements(), page.getTotalPages());
        List<Resource<T>> resources = new ArrayList<>();
        for (T it : page) resources.add(this.process(new Resource<>(it)));
        return new PagedResources<>(resources, pageMetadata);
    }

    default PagedResources<Resource<T>> empty(Pageable pageable) {
        PagedResources.PageMetadata pageMetadata = new PagedResources.PageMetadata(pageable.getPageSize(), 0, 0, 0);
        return new PagedResources<>(new ArrayList<>(), pageMetadata);
    }
}
