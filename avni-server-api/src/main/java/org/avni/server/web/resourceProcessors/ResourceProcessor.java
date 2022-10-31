package org.avni.server.web.resourceProcessors;

import org.springframework.hateoas.Resource;

public interface ResourceProcessor<Entity> {
    public Resource<Entity> process(Resource<Entity> resource);
}
