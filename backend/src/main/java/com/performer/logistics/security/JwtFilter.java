package com.performer.logistics.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain)
        throws ServletException, IOException {

    String header = request.getHeader("Authorization");
    System.out.println(">>> JwtFilter: Authorization header = " + header);

    if (header != null && header.startsWith("Bearer ")) {
        String token = header.substring(7);
        System.out.println(">>> JwtFilter: Token recibido = " + token);

        if (jwtUtil.isTokenValid(token)) {
            Claims claims = jwtUtil.getClaims(token);
            String email = claims.getSubject();
            String rol = claims.get("rol", String.class);

            System.out.println(">>> JwtFilter: Token válido. Email=" + email + ", Rol=" + rol);

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + rol);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, Collections.singletonList(authority));

            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            System.out.println(">>> JwtFilter: Autenticación establecida en SecurityContext");
        } else {
            System.out.println(">>> JwtFilter: Token inválido");
        }
    } else {
        System.out.println(">>> JwtFilter: No se encontró header Authorization");
    }

    filterChain.doFilter(request, response);
}

}