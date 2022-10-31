package org.avni.server.common;

import org.avni.messaging.domain.EntityType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Messageable {
    EntityType value() default EntityType.Subject;

}
