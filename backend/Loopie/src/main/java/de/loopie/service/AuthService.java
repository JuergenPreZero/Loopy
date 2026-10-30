package de.loopie.service;

import de.loopie.config.jwt.JwtService;
import de.loopie.dto.AuthResponseDTO;
import de.loopie.dto.LoginRequest;
import de.loopie.dto.RegisterRequest;
import de.loopie.dto.UserResponseDTO;
import de.loopie.entity.User;
import de.loopie.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.BadCredentialsException;

import java.security.SecureRandom;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final String CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int PUBLIC_ID_LENGTH = 8;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponseDTO registerUser(RegisterRequest request) {
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
        String token = jwtService.generateToken(savedUser);

        return new AuthResponseDTO(token, new UserResponseDTO(savedUser));
    }

    public AuthResponseDTO login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new BadCredentialsException("Invalid E-Mail or Password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid E-Mail or Password.");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponseDTO(token, new UserResponseDTO(user));
    }

    private String generatePublicId() {
        StringBuilder sb = new StringBuilder(PUBLIC_ID_LENGTH);
        for (int i = 0; i < PUBLIC_ID_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(secureRandom.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}