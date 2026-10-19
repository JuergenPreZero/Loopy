package de.loopie.service;

import de.loopie.dto.LoginRequest;
import de.loopie.dto.RegisterRequest;
import de.loopie.dto.UserResponseDTO;
import de.loopie.entity.User;
import de.loopie.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;

/**
 * Service managing user authentication, registration, and credential verification.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    //Character pool for generating public IDs
    private static final String CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int PUBLIC_ID_LENGTH = 8;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user account with normalized email, encrypted password, and a unique 8-character public ID.
     *
     * @param request data transfer object containing registration details
     * @return the newly created user as a {@link UserResponseDTO}
     */
    @Transactional
    public UserResponseDTO registerUser(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("This E-mail already exists");
        }

        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password too short");
        }

        User newUser = new User();
        newUser.setFirstName(request.getFirstName().trim());
        newUser.setLastName(request.getLastName().trim());
        newUser.setEmail(normalizedEmail);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        String generatedPublicId;
        do {
            generatedPublicId = generatePublicId();
        } while (userRepository.existsByPublicId(generatedPublicId));

        newUser.setPublicId(generatedPublicId);

        User savedUser = userRepository.save(newUser);
        return new UserResponseDTO(savedUser);
    }

    /**
     * Authenticates an existing user against stored credentials.
     *
     * @param request data transfer object containing login email and raw password
     * @return the authenticated user as a {@link UserResponseDTO}
     */
    public UserResponseDTO login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new IllegalArgumentException("Invalid E-Mail or Password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid E-Mail or Password.");
        }
        return new UserResponseDTO(user);
    }

    private String generatePublicId() {
        StringBuilder sb = new StringBuilder(PUBLIC_ID_LENGTH);
        for (int i = 0; i < PUBLIC_ID_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(secureRandom.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}