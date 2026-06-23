package com.bank.core.lib.filter;


import com.github.f4b6a3.ulid.Ulid;
import com.github.f4b6a3.ulid.UlidCreator;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import static com.bank.common.constant.StringConstant.REQUEST_ID;

@Component
public class RequestIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String requestId = request.getHeader(REQUEST_ID);

            if (requestId == null || requestId.isBlank()) {
                requestId = UlidCreator.getUlid().toString();
            }

            MDC.put(REQUEST_ID, requestId);
            response.setHeader(REQUEST_ID, requestId);

            filterChain.doFilter(request, response);

        } finally {
            MDC.clear();
        }
    }
}