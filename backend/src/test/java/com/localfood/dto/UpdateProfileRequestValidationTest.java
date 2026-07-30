package com.localfood.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UpdateProfileRequestValidationTest {
    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void acceptsAsciiAndVietnameseUserNames() {
        assertTrue(validator.validate(request("foodie_hanoi-24")).isEmpty());
        assertTrue(validator.validate(request("ẨmThực.HàNội")).isEmpty());
    }

    @Test
    void rejectsSpacesAndUnsupportedSymbols() {
        assertFalse(validator.validate(request("foodie ha noi")).isEmpty());
        assertFalse(validator.validate(request("foodie@hanoi")).isEmpty());
    }

    private static UpdateProfileRequest request(String userName) {
        return UpdateProfileRequest.builder().userName(userName).build();
    }
}
