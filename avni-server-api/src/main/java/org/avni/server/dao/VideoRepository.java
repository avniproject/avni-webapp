package org.avni.server.dao;

import org.avni.server.domain.Video;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "video", path = "video")
public interface VideoRepository extends ImplReferenceDataRepository<Video>, FindByLastModifiedDateTime<Video> {

    Video findByTitle(String title);

    Video findByTitleIgnoreCase(String title);

    @Override
    default Video findByName(String name) {
        return findByTitle(name);
    }

    @Override
    default Video findByNameIgnoreCase(String name) {
        return findByTitleIgnoreCase(name);
    }
}
