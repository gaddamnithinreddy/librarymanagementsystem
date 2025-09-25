# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| CVSS v3.0 | Supported Versions                        |
| --------- | ----------------------------------------- |
| 9.0-10.0  | Releases within the previous three months |
| 4.0-8.9   | Most recent release                       |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **your-email@example.com**. You will receive a response from us within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Measures

This project implements several security measures:

### Authentication & Authorization
- JWT-based authentication
- Separate admin and user authentication
- Password hashing using bcrypt
- Token expiration and validation

### Data Protection
- Environment variables for sensitive data
- Input validation and sanitization
- CORS configuration
- SQL injection prevention through Mongoose ODM

### Best Practices
- Regular dependency updates
- Secure headers implementation
- Error handling without information disclosure
- Rate limiting (recommended for production)

## Security Guidelines for Contributors

1. **Never commit sensitive data** (passwords, API keys, tokens)
2. **Use environment variables** for all configuration
3. **Validate all user inputs** on both client and server side
4. **Follow OWASP guidelines** for web application security
5. **Keep dependencies updated** and monitor for vulnerabilities

## Recommended Security Enhancements for Production

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Helmet.js**: Add security headers
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Implement comprehensive input validation
5. **Logging**: Set up security event logging
6. **Monitoring**: Monitor for suspicious activities

## Security Contact

For security-related questions or concerns, please contact: your-email@example.com