package com.local.localservice.filter;

import com.local.localservice.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip authentication for login, register, and public endpoints
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip authentication for login, register, and public endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/auth/login") || 
            path.startsWith("/auth/register") || 
            path.startsWith("/auth/forgot-password") ||
            path.startsWith("/auth/reset-password") ||
            path.startsWith("/services") ||
            path.startsWith("/doctors") || // Note: /admin/doctors/... is NOT covered by this, which is correct
            path.startsWith("/reviews") ||
            path.startsWith("/actuator") ||
            path.startsWith("/create-checkout-session") ||
            path.startsWith("/api/users/stats") ||
            path.startsWith("/api/slots/doctor") ||
            path.startsWith("/ws") || // Allow WebSocket handshake
            path.startsWith("/api/ai") || // Allow AI Chatbot
            path.startsWith("/uploads")) { // Allow access to uploads
            filterChain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        // Extract JWT token from Authorization header
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }
        }

        // Validate token
        if (email != null) {
            try {
                if (jwtUtil.validateToken(jwt, email)) {
                    // Token is valid, set user info in request attributes
                    request.setAttribute("userId", jwtUtil.extractUserId(jwt));
                    request.setAttribute("email", email);
                    request.setAttribute("role", jwtUtil.extractRole(jwt));
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Invalid token");
                    return;
                }
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token validation failed");
                return;
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authorization token required");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
