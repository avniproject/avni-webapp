package org.openchs.server.domain;

import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

public class CHSEntity {
    @CreatedBy
    private User createdBy;

    @CreatedDate
    private DateTime createdDate;

    @LastModifiedBy
    private User lastModifiedBy;

    @LastModifiedDate
    private DateTime lastModifiedDate;
}