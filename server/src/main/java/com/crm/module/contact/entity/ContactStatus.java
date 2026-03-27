package com.crm.module.contact.entity;

/**
 * Estado del contacto en el funnel de ventas.
 * Requisito: 9.1, 12.1
 */
public enum ContactStatus {
    NEW,
    CONTACTED,
    QUALIFIED,
    LOST,
    CONVERTED
}
