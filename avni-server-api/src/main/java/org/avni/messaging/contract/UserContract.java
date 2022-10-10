package org.avni.messaging.contract;

import org.avni.server.domain.User;

public class UserContract {
    private String username;
    private String name;
    private Long id;
    private String uuid;

    public UserContract() {
    }

    public UserContract(User user) {
        setUsername(user.getUsername());
        setName(user.getName());
        setId(user.getId());
        setUuid(user.getUuid());
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
}
