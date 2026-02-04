package com.vedant.Chat_bot.service;

import com.vedant.Chat_bot.entity.User;
import com.vedant.Chat_bot.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveUserIfNotExists(
            String firebaseUid,
            String email,
            String name,
            String provider
    ) {
        Optional<User> existingUser = userRepository.findByFirebaseUid(firebaseUid);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        User user = User.builder()
                .firebaseUid(firebaseUid)
                .email(email)
                .name(name)
                .provider(provider)
                .build();

        return userRepository.save(user);
    }
}

