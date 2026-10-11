package com.nexcart.order.client;

import com.nexcart.order.dto.UserDto;
import com.nexcart.order.exception.ServiceUnavailableException;
import com.nexcart.order.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Validates the caller's JWT by asking user-service for the current profile.
 * The {@code Authorization} header received by order-service is forwarded
 * unchanged; a {@code 200} response both proves the token is valid and tells
 * us who owns the order. The {@link RestTemplate} is Eureka-aware
 * ({@code @LoadBalanced}), so {@code http://user-service} resolves through
 * the service registry.
 */
@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceUrl;

    public UserServiceClient(RestTemplate restTemplate,
                             @Value("${app.user-service.url}") String userServiceUrl) {
        this.restTemplate = restTemplate;
        this.userServiceUrl = userServiceUrl;
    }

    /**
     * @param authorizationHeader the raw {@code Authorization} header value
     * @return the authenticated user's profile
     * @throws UnauthorizedException      if the token is invalid or expired
     * @throws ServiceUnavailableException if user-service cannot be reached
     */
    public UserDto validateAndGetUser(String authorizationHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorizationHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<UserDto> response = restTemplate.exchange(
                    userServiceUrl + "/api/users/me",
                    HttpMethod.GET,
                    entity,
                    UserDto.class);
            UserDto user = response.getBody();
            if (user == null || user.getId() == null) {
                throw new UnauthorizedException("Invalid authentication token");
            }
            return user;
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden e) {
            throw new UnauthorizedException("Invalid or expired authentication token");
        } catch (RestClientException e) {
            throw new ServiceUnavailableException("User service is currently unavailable");
        }
    }
}
