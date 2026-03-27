package com.crm.module.user.dto;

import lombok.Value;

@Value
public class UpdateProfileRequest {

    String name;
    String phone;
    String timezone;
}
