package org.avni.server.web;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    default List<Resource<T>> wrap(List<T> list) {
        return list.stream().map(t -> this.process(new Resource<>(t))).collect(Collectors.toList());
    }

    default PagedResources<Resource<T>> empty(Pageable pageable) {
        PagedResources.PageMetadata pageMetadata = new PagedResources.PageMetadata(pageable.getPageSize(), 0, 0, 0);
        return new PagedResources<>(new ArrayList<>(), pageMetadata);
    }

    default PagedResources<T> wrapListAsPage(List list) {
        PagedResources.PageMetadata pageMetadata = new PagedResources.PageMetadata(list.size(), 0, list.size(), 1);
        return new PagedResources<>(list, pageMetadata);
    }
}
