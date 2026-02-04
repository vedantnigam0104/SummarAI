package com.vedant.Chat_bot.controller;

import com.google.firebase.auth.FirebaseToken;
import com.vedant.Chat_bot.entity.User;
import com.vedant.Chat_bot.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(HttpServletRequest request) {

        FirebaseToken decoded =
                (FirebaseToken) request.getAttribute("firebaseUser");

        if (decoded == null) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("error", "Invalid token"));
        }

        // Extract provider (google, password, etc.)
        Map<String, Object> firebaseClaims =
                (Map<String, Object>) decoded.getClaims().get("firebase");

        String provider = firebaseClaims != null
                ? firebaseClaims.get("sign_in_provider").toString()
                : "unknown";

        // Save user if not exists
        User user = userService.saveUserIfNotExists(
                decoded.getUid(),
                decoded.getEmail(),
                decoded.getName(),
                provider
        );

        // Response to frontend
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "uid", user.getFirebaseUid(),
                "email", user.getEmail(),
                "name", user.getName(),
                "provider", user.getProvider()
        ));
    }
}
