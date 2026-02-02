package com.vedant.Chat_bot.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    // Environment variable for production (the entire JSON string)
    private static final String FIREBASE_ENV_JSON = System.getenv("FIREBASE_CREDENTIAL_JSON");

    // Classpath location for local development
    private static final String LOCAL_JSON_PATH = "firebase/serviceAccountKey.json";

    @PostConstruct
    public void init() throws Exception {

        // ✅ Print length for debug
        System.out.println("🔹 Firebase JSON length: " + (FIREBASE_ENV_JSON != null ? FIREBASE_ENV_JSON.length() : 0));

        InputStream serviceAccount;

        if (FIREBASE_ENV_JSON != null && !FIREBASE_ENV_JSON.isEmpty()) {
            // ✅ Production (Render): read JSON from environment variable
            serviceAccount = new ByteArrayInputStream(FIREBASE_ENV_JSON.getBytes());
            System.out.println("🔹 Firebase service account loaded from environment variable");
        } else {
            // ✅ Local dev: read JSON from classpath
            ClassPathResource resource = new ClassPathResource(LOCAL_JSON_PATH);
            serviceAccount = resource.getInputStream();

            if (serviceAccount == null) {
                throw new IllegalStateException("❌ Firebase serviceAccountKey.json not found in classpath: " + LOCAL_JSON_PATH);
            }
            System.out.println("🔹 Firebase service account loaded from classpath");
        }

        // Initialize Firebase options
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        // Initialize FirebaseApp only if not already initialized
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
            System.out.println("✅ Firebase initialized successfully");
        }
    }
}
