package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Table(name = "msg91_config")
@BatchSize(size = 100)
public class Msg91Config extends OrganisationAwareEntity {

    @Column
    private String authKey;

    @Column
    private String otpSmsTemplateId;

    @Column
    private Long otpLength;

    public String getAuthKey() {
        return authKey;
    }

    public void setAuthKey(String authKey) {
        this.authKey = authKey;
    }

    public String getOtpSmsTemplateId() {
        return otpSmsTemplateId;
    }

    public void setOtpSmsTemplateId(String otpSmsTemplateId) {
        this.otpSmsTemplateId = otpSmsTemplateId;
    }

    public Long getOtpLength() {
        return otpLength;
    }

    public void setOtpLength(Long otpLength) {
        this.otpLength = otpLength;
    }
}
