package locadora.backend.controller;

import jakarta.validation.Valid;
import locadora.backend.dto.AuthResponse;
import locadora.backend.dto.LoginRequest;
import locadora.backend.dto.RegisterRequest;
import locadora.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Registro público de cliente (atalho para /register/cliente)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        request.setIsFuncionario(false);
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/register/cliente
     * Registro público de cliente
     */
    @PostMapping("/register/cliente")
    public ResponseEntity<AuthResponse> registerCliente(@Valid @RequestBody RegisterRequest request) {
        request.setIsFuncionario(false);
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/register/funcionario
     * Registro de funcionário (apenas funcionários podem criar)
     */
    @PostMapping("/register/funcionario")
    @PreAuthorize("hasRole('FUNCIONARIO')")
    public ResponseEntity<AuthResponse> registerFuncionario(@Valid @RequestBody RegisterRequest request) {
        request.setIsFuncionario(true);
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Login único para clientes e funcionários
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/test
     * Endpoint de teste público
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API funcionando!");
    }
}
