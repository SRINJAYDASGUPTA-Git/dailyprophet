package net.ibmer.dailyprophet.auth.services;

import net.ibmer.dailyprophet.auth.dto.AuthenticationRequest;
import net.ibmer.dailyprophet.auth.dto.AuthenticationResponse;
import net.ibmer.dailyprophet.email.EmailService;
import net.ibmer.dailyprophet.email.EmailTemplatename;
import net.ibmer.dailyprophet.exceptions.ExistingEmailConflictException;
import net.ibmer.dailyprophet.security.JWTService;
import net.ibmer.dailyprophet.user.models.Token;
import net.ibmer.dailyprophet.user.models.User;
import net.ibmer.dailyprophet.user.repositories.RoleRepository;
import net.ibmer.dailyprophet.user.repositories.TokenRepository;
import net.ibmer.dailyprophet.user.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.MessagingException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final JWTService jWTService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    public AuthenticationResponse login(AuthenticationRequest authenticationRequest) {
        userRepository.findByEmail(authenticationRequest.email())
                .orElseThrow(() -> new NoSuchElementException ("User not found"));
        return getAuthenticationResponse(authenticationRequest);
    }

    public void register(AuthenticationRequest authenticationRequest) throws BadRequestException, jakarta.mail.MessagingException {
        var userRole = roleRepository.findByName("USER")
                .orElseThrow (() -> new IllegalStateException ("ROLE USER was not initialized"));

        if (userRepository.existsByEmail(authenticationRequest.email())) {
            throw new ExistingEmailConflictException("Email already exists");
        }
        if (authenticationRequest.name() == null || authenticationRequest.email() == null || authenticationRequest.password() == null) {
            throw new BadRequestException("Name, email, and password must not be null");
        }
        
        User user = User.builder()
                .name(authenticationRequest.name())
                .username(authenticationRequest.username())
                .email(authenticationRequest.email())
                .password(passwordEncoder.encode (authenticationRequest.password()))
                .imageUrl (authenticationRequest.imageUrl () == null ?
                        "https://avatar.vercel.sh/"+authenticationRequest.name ()+"?rounded=60" :
                        authenticationRequest.imageUrl ())
                .accountLocked (false)
                .enabled (false)
                .roles (List.of (userRole))
                .build();

        userRepository.save(user);
        sendActivationEmail (user);
//        return buildJwtResponse(user);
    }
    public void sendActivationEmail(User user) throws MessagingException, jakarta.mail.MessagingException {
        var newToken = generateAndSaveActivationToken (user);
        emailService.sendActivationMail(
                user.getEmail(),
                user.getName(),
                EmailTemplatename.ACTIVATE_ACCOUNT,
                activationUrl,
                newToken,
                "Activate your account"
        );
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode();

        var token = Token.builder ()
                .token (generatedToken)
                .createdAt (LocalDateTime.now ())
                .expiresAt (LocalDateTime.now ().plusMinutes (15))
                .user (user)
                .build ();
        tokenRepository.save (token);
        return generatedToken;
    }

    private String generateActivationCode() {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom ();
        for (int i = 0; i < 6; i++) {
            int randomIndex = secureRandom.nextInt (characters.length ());
            codeBuilder.append (characters.charAt (randomIndex));
        }
        return codeBuilder.toString ();
    }

    public AuthenticationResponse activateAccount(String token) throws MessagingException, jakarta.mail.MessagingException {
        Token savedToken = tokenRepository.findByToken (token)
                .orElseThrow (() -> new NoSuchElementException ("Token not found"));

        if(LocalDateTime.now ().isAfter (savedToken.getExpiresAt ())){
            sendActivationEmail (savedToken.getUser ());
            throw new RuntimeException ("Token expired. New token sent to email");
        }

        var user = userRepository.findById (savedToken.getUser ().getId ())
                .orElseThrow (() -> new NoSuchElementException ("User not found"));
        user.setEnabled (true);
        userRepository.save (user);
        savedToken.setValidatedAt (LocalDateTime.now ());
        tokenRepository.save (savedToken);
        return buildJwtResponse(user);
    }
    private AuthenticationResponse getAuthenticationResponse(AuthenticationRequest authenticationRequest) {
        var auth = authenticationManager.authenticate (
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.email (),
                        authenticationRequest.password ()
                )
        );
        var userVar = ((User) auth.getPrincipal ());
        if(userVar == null){
            throw new IllegalStateException("Authenticated principal cannot be null.");
        }

        return buildJwtResponse(userVar);
    }

    private AuthenticationResponse buildJwtResponse(User user){
        var claims = new HashMap<String, Object>();
        claims.put ("user_email", user.getEmail ());
        claims.put("username", user.getUsername ());
        var jwtToken = jWTService.generateAccessToken (
                claims,
                user
        );

        var refreshToken = jWTService.generateRefreshToken (
                claims,
                user
        );

        return AuthenticationResponse.builder ()
                .access_token (jwtToken)
                .refresh_token (refreshToken)
                .build ();
    }

    @Transactional
    public AuthenticationResponse refreshToken(Authentication connectedUser) {
        if (connectedUser == null || connectedUser.getPrincipal() == null) {
            throw new IllegalStateException("Authentication context or principal is missing.");
        }

        User principal = (User) connectedUser.getPrincipal();

        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        return buildJwtResponse(user);
    }
}