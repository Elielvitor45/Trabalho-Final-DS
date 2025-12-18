package locadora.backend.config;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@Configuration
@EnableWebSecurity
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
                // Desabilitar CSRF (API Stateless com JWT)
                .csrf(csrf -> csrf.disable())

                // Configurar CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Sessão Stateless (JWT)
                .sessionManagement(session -> 
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Desabilitar autenticação padrão
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())

                // Regras de autorização
                .authorizeHttpRequests(auth -> auth
                        // ===== ENDPOINTS PÚBLICOS  =====
                        
                        // Auth - Registro e Login
                        .requestMatchers("/api/auth/**").permitAll()
                        
                        // Veículos - Listagem pública
                        .requestMatchers(HttpMethod.GET, "/api/veiculos/**").permitAll()                        
                        
                        // ===== ENDPOINTS PRIVADOS =====
                        
                        // Usuários - Todos os endpoints requerem autenticação
                        .requestMatchers("/api/usuarios/**").authenticated()
                        
                        // Locações - Todos os endpoints requerem autenticação
                        .requestMatchers("/api/locacoes/**").authenticated()
                        
                        // Veículos - Operações de modificação requerem autenticação
                        .requestMatchers(HttpMethod.POST, "/api/veiculos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/veiculos/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/veiculos/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/veiculos/**").authenticated()
                        
                        // Qualquer outra requisição requer autenticação
                        .anyRequest().authenticated()
                )

                // Adicionar filtro JWT antes do filtro de autenticação padrão
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuração CORS para permitir requisições do frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Converter a string do properties em lista
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", 
            "POST", 
            "PUT", 
            "PATCH", 
            "DELETE", 
            "OPTIONS"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With"
        ));
        
        // Expor headers na resposta
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));
        
        // Permitir envio de credenciais (cookies, headers de auth)
        configuration.setAllowCredentials(true);
        
        // Tempo de cache da configuração CORS (1 hora)
        configuration.setMaxAge(3600L);
        
        // Aplicar configuração para todas as rotas
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
