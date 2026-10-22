package de.loopie.service;

import de.loopie.dto.UpdateUserRequest;
import de.loopie.dto.UserResponseDTO;
import de.loopie.entity.User;
import de.loopie.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User " + userId + " not found."));
    }

    public UserResponseDTO getUserProfile(UUID userId) {
        return new UserResponseDTO(getUserById(userId));
    }

    @Transactional
    public UserResponseDTO updateUserProfile(UUID userId, UpdateUserRequest request) {
        User user = getUserById(userId);

        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name must not be empty.");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name must not be empty.");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email must not be empty.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
            throw new IllegalArgumentException("This email address is already in use.");
        }

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(normalizedEmail);

        return new UserResponseDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUserById(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User " + userId + " not found.");
        }
        userRepository.deleteById(userId);
    }
}