package com.performer.logistics.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String jwtSecret =
            "LASUPERCLAVEQUETIENECOMO32CARACTERESMINIMO12345678.";
    private final long jwtExpirationMs = 86400000; // 1 día

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String rol, String nombre) {
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .claim("nombre", nombre)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            System.out.println(">>> JwtUtil: Claims = " + claims);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            System.out.println(">>> JwtUtil: Error validando token = " + e.getMessage());
            return false;
        }
    }
}