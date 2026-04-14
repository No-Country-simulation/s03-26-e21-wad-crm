package com.crm.module.user.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Value;

@Value
public class UpdateProfileRequest {

    @JsonCreator
    public UpdateProfileRequest(String name, String phone, String timezone) {
        this.name = name;
        this.phone = phone;
        this.timezone = timezone;
    }
}
