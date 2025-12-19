package locadora.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import locadora.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Pegar header Authorization
        final String authHeader = request.getHeader("Authorization");

        // Se não tem header ou não começa com "Bearer ", continua sem autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extrair token (remover "Bearer ")
            final String jwt = authHeader.substring(7);
            
            // Extrair email do token
            final String userEmail = jwtService.extractEmail(jwt);

            // Se email existe e usuário não está autenticado ainda
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Validar token
                if (jwtService.isTokenValid(jwt)) {
                    
                    // Extrair a role do token
                    String role = jwtService.extractRole(jwt);
                    
                    // Criar authority com a role
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role);
                    
                    // Criar autenticação com a authority
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userEmail,
                            null,
                            List.of(authority)
                    );

                    // Adicionar detalhes da requisição
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Setar no contexto de segurança
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao processar JWT: " + e.getMessage());
        }

        // Continuar a cadeia de filtros
        filterChain.doFilter(request, response);
    }
}
