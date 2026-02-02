package com.vedant.Chat_bot.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    // Environment variable containing the entire JSON string
    private static final String FIREBASE_ENV_JSON = System.getenv("FIREBASE_CREDENTIAL_JSON");

    // Local fallback path for development
    private static final String LOCAL_JSON_PATH = "firebase/serviceAccountKey.json";

    @PostConstruct
    public void init() {
        try {
            InputStream serviceAccount;

            if (FIREBASE_ENV_JSON != null && !FIREBASE_ENV_JSON.isEmpty()) {
                // ✅ Production: replace literal \n with real newlines
                String jsonWithNewlines = FIREBASE_ENV_JSON.replace("\\n", "\n");
                serviceAccount = new ByteArrayInputStream(jsonWithNewlines.getBytes(StandardCharsets.UTF_8));
                System.out.println("🔹 Firebase service account loaded from environment variable, length: " + jsonWithNewlines.length());
            } else {
                // ✅ Local dev: load JSON from classpath
                ClassPathResource resource = new ClassPathResource(LOCAL_JSON_PATH);
                serviceAccount = resource.getInputStream();
                System.out.println("🔹 Firebase service account loaded from classpath");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialized successfully");
            }

        } catch (Exception e) {
            // 🔹 Print full stack trace for debugging
            System.err.println("❌ Failed to initialize Firebase:");
            e.printStackTrace();
            throw new IllegalStateException("Failed to initialize Firebase", e);
        }
    }
}
