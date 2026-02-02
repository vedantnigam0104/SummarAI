package com.vedant.Chat_bot.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    // Environment variable for production (absolute path to service account JSON)
    @Value("${FIREBASE_SERVICE_ACCOUNT_PATH:#{null}}")
    private String envPath;

    // Classpath location for local development
    @Value("${firebase.service.account.location:firebase/serviceAccountKey.json}")
    private String classpathLocation;

    @PostConstruct
    public void init() throws Exception {

        InputStream serviceAccount;

        if (envPath != null && !envPath.isEmpty()) {
            // ✅ Production: load JSON from external path
            serviceAccount = new FileInputStream(envPath);
            System.out.println("🔹 Firebase service account loaded from ENV path");
        } else {
            // ✅ Local dev: load JSON from resources/classpath
            ClassPathResource resource = new ClassPathResource(classpathLocation);
            serviceAccount = resource.getInputStream();

            if (serviceAccount == null) {
                throw new IllegalStateException("❌ Firebase serviceAccountKey.json not found in classpath: " + classpathLocation);
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
