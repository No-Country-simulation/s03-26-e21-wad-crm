package com.crm.module.booking.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "booking_settings")
public class BookingSettings extends AuditableEntity {

    @Column(name = "workspace_id", nullable = false, unique = true)
    private UUID workspaceId;

    @Column(name = "is_enabled")
    private Boolean isEnabled = false;

    @Column(name = "default_duration")
    private Integer defaultDuration = 30;

    @Column(name = "buffer_minutes")
    private Integer bufferMinutes = 15;

    @Column(name = "work_days")
    private String workDays = "MON-FRI";

    @Column(name = "work_start_time")
    private String workStartTime = "09:00";

    @Column(name = "work_end_time")
    private String workEndTime = "18:00";

    @Column(name = "timezone")
    private String timezone = "America/Argentina/Buenos_Aires";

    @Column(name = "booking_page_enabled")
    private Boolean bookingPageEnabled = false;

    @Column(name = "booking_page_slug")
    private String bookingPageSlug;

    @Column(name = "primary_color")
    private String primaryColor = "#2563EB";

    @Column(name = "send_confirmation")
    private Boolean sendConfirmation = true;

    @Column(name = "send_reminder")
    private Boolean sendReminder = true;

    @Column(name = "reminder_hours")
    private Integer reminderHours = 24;
}