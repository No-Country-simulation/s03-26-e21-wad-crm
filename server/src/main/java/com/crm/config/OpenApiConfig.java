package com.crm.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
<<<<<<< HEAD
import io.swagger.v3.oas.models.info.License;
=======
>>>>>>> origin/feat/startup-crm/whatsapp
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

<<<<<<< HEAD
=======
/**
 * Configuración de OpenAPI / Swagger UI.
 * Agrega soporte para autenticación JWT con botón "Authorize" en Swagger UI.
 */
>>>>>>> origin/feat/startup-crm/whatsapp
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Startup CRM API")
<<<<<<< HEAD
                        .version("1.0.0")
                        .description("CRM inteligente con integración WhatsApp + Email para startups")
                        .contact(new Contact()
                                .name("Startup CRM Team")
                                .email("support@startupcrm.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
=======
                        .version("0.0.1-SNAPSHOT")
                        .description("API del CRM con integración WhatsApp + Email")
                        .contact(new Contact()
                                .name("No-Country s03-26-e21-wad-crm")
                        )
                )
>>>>>>> origin/feat/startup-crm/whatsapp
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
<<<<<<< HEAD
                                        .description("Ingresa el token JWT obtenido del endpoint /api/auth/login")));
=======
                                        .description("Ingresa el token JWT obtenido en /api/auth/login")
                        )
                );
>>>>>>> origin/feat/startup-crm/whatsapp
    }
}
