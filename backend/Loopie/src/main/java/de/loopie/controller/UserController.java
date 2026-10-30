package de.loopie.controller;

import de.loopie.config.jwt.UserPrincipal;
import de.loopie.dto.UpdateUserRequest;
import de.loopie.dto.UserResponseDTO;
import de.loopie.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getUserProfile(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUserProfile(principal.getId(), request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        userService.deleteUserById(principal.getId());
        return ResponseEntity.noContent().build();
    }
}