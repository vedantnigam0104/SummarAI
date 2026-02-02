package com.vedant.Chat_bot.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FireBaseAuthService {

    public FirebaseToken verify(String token) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(token);
    }
}
