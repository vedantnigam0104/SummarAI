package com.vedant.Chat_bot.controller;

import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(HttpServletRequest request) {

        FirebaseToken decoded = (FirebaseToken) request.getAttribute("firebaseUser");

        if (decoded == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        Map<String, Object> firebaseClaims = (Map<String, Object>) decoded.getClaims().get("firebase");
        String provider = firebaseClaims != null
                ? firebaseClaims.get("sign_in_provider").toString()
                : "unknown";

        return ResponseEntity.ok(Map.of(
                "uid", decoded.getUid(),
                "email", decoded.getEmail(),
                "name", decoded.getName(),
                "provider", provider
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Optional: Clear any cookies if you are using them
        // response.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");

        // Just return success; client is responsible for removing tokens
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
