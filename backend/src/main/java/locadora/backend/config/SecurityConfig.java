package locadora.backend.config;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                .authorizeHttpRequests(auth -> auth
                        // ===== H2 CONSOLE (APENAS DESENVOLVIMENTO) =====
                        .requestMatchers("/h2-console/**").permitAll()

                        // ===== ENDPOINTS PÚBLICOS =====
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/register/cliente").permitAll()
                        .requestMatchers("/api/auth/test").permitAll()

                        // Auth - Endpoint protegido
                        .requestMatchers("/api/auth/register/funcionario").hasRole("FUNCIONARIO")

                        // Veículos - Listagem pública
                        .requestMatchers(HttpMethod.GET, "/api/veiculos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/veiculos/disponiveis").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/veiculos/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/veiculos/categoria/**").permitAll()

                        // Veículos - Operações protegidas
                        .requestMatchers(HttpMethod.POST, "/api/veiculos").hasRole("FUNCIONARIO")
                        .requestMatchers(HttpMethod.PUT, "/api/veiculos/**").hasRole("FUNCIONARIO")
                        .requestMatchers(HttpMethod.PATCH, "/api/veiculos/**").hasRole("FUNCIONARIO")
                        .requestMatchers(HttpMethod.DELETE, "/api/veiculos/**").hasRole("FUNCIONARIO")

                        // Usuários e Locações - Autenticados
                        .requestMatchers("/api/usuarios/**").authenticated()
                        .requestMatchers("/api/locacoes/**").authenticated()

                        .anyRequest().authenticated())
                // IMPORTANTE: Permitir frames para H2 Console
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));

        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", "Content-Type"));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
