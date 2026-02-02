package com.vedant.Chat_bot.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class FirebaseAuthFilter extends OncePerRequestFilter {

    // 🔥 Add CORS headers manually (important for 401 responses)
    private void addCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // ✅ Always allow preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            addCorsHeaders(response);
            response.setStatus(HttpServletResponse.SC_OK);
            System.out.println("[FirebaseAuthFilter] OPTIONS request - returning 200 OK with CORS headers");
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("[FirebaseAuthFilter] Authorization header: " + authHeader);

        // ❌ Missing or invalid Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            addCorsHeaders(response);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter()
                    .write("{\"error\":\"Authorization header missing or invalid\"}");
            System.out.println("[FirebaseAuthFilter] Missing or invalid Authorization header - 401 returned");
            return;
        }

        String idToken = authHeader.substring(7);
        System.out.println("[FirebaseAuthFilter] Received ID token: " + idToken);

        try {
            // 🔐 Verify Firebase ID token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

            // ✅ Attach decoded user to request
            request.setAttribute("firebaseUser", decodedToken);

            System.out.println("[FirebaseAuthFilter] Token verified successfully for UID: " + decodedToken.getUid());

        } catch (Exception e) {
            addCorsHeaders(response);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter()
                    .write("{\"error\":\"Invalid Firebase token\"}");
            System.out.println("[FirebaseAuthFilter] Invalid Firebase token: " + e.getMessage());
            e.printStackTrace();
            return;
        }

        // ✅ Continue filter chain
        filterChain.doFilter(request, response);
    }
}
