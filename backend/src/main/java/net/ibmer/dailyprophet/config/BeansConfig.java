package net.ibmer.dailyprophet.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Properties;

import static org.springframework.http.HttpHeaders.*;

@Configuration
@RequiredArgsConstructor
public class BeansConfig {
    private final UserDetailsService userDetailsService;

    @Value("${spring.mail.host}")
    String email_host;

    @Value("${spring.mail.port}")
    String email_port;

    @Value("${spring.mail.username}")
    String email_username;

    @Value("${spring.mail.password}")
    String email_password;

    @Value("${spring.mail.properties.mail.smtp.auth}")
    String email_auth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    String email_starttls;

    @Value("${spring.mail.properties.mail.smtp.ssl.trust}")
    String email_ssl_trust;
    @Bean
    public CorsFilter corsFilter() {
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials (true);
//        config.setAllowedOrigins (List.of ("*"));
        config.addAllowedOriginPattern("http://127.0.0.1:**");
        config.addAllowedOriginPattern("http://localhost:**");
        config.addAllowedOriginPattern("http://192.168.0.154:**");
        config.addAllowedOriginPattern ("http://0.0.0.0:**");
        config.addAllowedOriginPattern("https://enderdoes.srinjaydg.in");
        config.setAllowedHeaders (Arrays.asList (ORIGIN, CONTENT_TYPE, ACCEPT, AUTHORIZATION));
        config.setAllowedMethods (Arrays.asList ("GET", "POST", "PUT", "DELETE", "PATCH"));
        source.registerCorsConfiguration ("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public JavaMailSender javaMailSender() {

        Properties properties = new Properties();
        properties.put("mail.smtp.auth", email_auth);
        properties.put("mail.smtp.starttls.enable", email_starttls);
        properties.put("mail.smtp.host", email_host);
        properties.put("mail.smtp.port", email_port);
        properties.put("mail.smtp.ssl.trust", email_ssl_trust);


        JavaMailSenderImpl mailSender = new JavaMailSenderImpl ();
        mailSender.setHost(email_host);
        mailSender.setPort(Integer.parseInt(email_port));
        mailSender.setUsername(email_username);
        mailSender.setPassword(email_password);
        mailSender.setJavaMailProperties(properties);
        return mailSender;
    }
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
//        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper ();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
