package com.performer.logistics.repository;

import com.performer.logistics.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByEmail(String email);
    boolean existsByRfc(String rfc);
}
