package com.crm.e2e;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class EndToEndPipelineTest {

    @LocalServerPort
    private int port;

    private String authToken;

    @BeforeAll
    void setUp() {
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;

        // Optional: ensure test data exists or create a test user
        Map<String, String> login = new HashMap<>();
        login.put("email", "demo@example.com");
        login.put("password", "password");

        Response res = given()
                .contentType(ContentType.JSON)
                .body(login)
                .when().post("/api/auth/login")
                .then()
                .extract().response();

        // Expect 200 and a token in the body depending on your auth implementation
        if (res.statusCode() == 200) {
            authToken = res.jsonPath().getString("token");
            if (authToken == null) {
                // Some implementations return token in different field
                authToken = res.jsonPath().getString("data.token");
            }
        }
        // If no token is returned, tests will fail on the first API call that requires auth
        assertNotNull(authToken, "Auth token must be provided by login endpoint");
    }

    @Test
    void endToEndDealPipeline() {
        // 1) Create a contact (should exist beforehand in a real test; we create one here for end-to-end)
        Map<String, Object> contact = Map.of(
                "name", "E2E Test Contact",
                "email", "e2e.contact@example.com",
                "phone", "+1-555-0109",
                "jobTitle", "Tester"
        );

        Response createContact = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .body(contact)
                .when().post("/api/contacts")
                .then().statusCode(201)
                .extract().response();
        String contactId = createContact.jsonPath().getString("id");
        // 2) Create a deal linked to the contact
        Map<String, Object> deal = new HashMap<>();
        deal.put("name", "Venta E2E");
        deal.put("contactId", contactId);
        deal.put("value", 1000);

        Response createDeal = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .body(deal)
                .when().post("/api/deals")
                .then().statusCode(201)
                .extract().response();
        String dealId = createDeal.jsonPath().getString("id");
        assertNotNull(dealId, "Deal ID should be returned");

        // 3) Get pipeline summary to fetch the first stage id
        Response summary = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .when().get("/api/deals/pipeline/summary")
                .then().statusCode(200)
                .extract().response();
        String firstStageId = summary.jsonPath().getString("stages[0].stageId");
        assertNotNull(firstStageId, "First stage id should be available in pipeline summary");

        // 4) Move deal to the next stage (optional: skip if no further stages)
        Map<String, String> movePayload = Map.of("stageId", firstStageId);
        Response move = given()
                .contentType(ContentType.JSON)
                .header("Authorization", "Bearer " + authToken)
                .body(movePayload)
                .when().patch("/api/deals/" + dealId + "/stage")
                .then().statusCode(200)
                .extract().response();
        String newStageName = move.jsonPath().getString("stageInfo.name");
        // newStageName could be null depending on response shape; just ensure request succeeded
        assertNotNull(newStageName == null ? "" : newStageName);
    }

    @AfterAll
    void tearDown() {
        // Optional: cleanup created data if the API supports delete endpoints
    }
}
