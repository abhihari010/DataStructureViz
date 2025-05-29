# Migration to Spring Boot Backend

This guide explains how to migrate from the current Node.js/Express backend to the new Spring Boot backend while keeping the React frontend.

## Overview

I've created a complete Spring Boot backend that replaces the current Node.js backend with:
- JWT-based authentication instead of Replit Auth
- Spring Security for authorization
- Spring Data JPA with PostgreSQL
- RESTful API endpoints matching the current frontend expectations

## Backend Structure

```
backend/
├── src/main/java/com/dsavisualizer/
│   ├── config/          # Security and CORS configuration
│   ├── controller/      # REST API controllers
│   ├── dto/             # Data transfer objects
│   ├── entity/          # JPA entities (User, UserProgress, etc.)
│   ├── repository/      # Data access repositories
│   ├── security/        # JWT utilities and filters
│   └── service/         # Business logic services
├── src/main/resources/
│   └── application.yml  # Spring Boot configuration
└── pom.xml             # Maven dependencies
```

## Migration Steps

### 1. Prerequisites

Ensure you have Java 17+ installed:
```bash
java -version
```

### 2. Database Setup

The Spring Boot backend uses the same PostgreSQL database. No schema changes are required as the JPA entities match the existing Drizzle schema.

### 3. Environment Variables

Update your environment variables for the Spring Boot backend:
```bash
# Required
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret_key_min_32_chars

# Optional
SERVER_PORT=8080
```

### 4. Start the Spring Boot Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on port 8080 and automatically create database tables if they don't exist.

### 5. Update Frontend Configuration

The frontend needs to be updated to use JWT authentication instead of Replit Auth:

1. **Replace authentication hook**: Use `useAuthJWT` instead of `useAuth`
2. **Update API calls**: All API calls now require JWT tokens
3. **Add login/register pages**: Users can create accounts with email/password

### 6. Frontend API Changes

The new backend provides these endpoints:

**Authentication:**
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `GET /api/auth/user` - Get current user info

**Progress:**
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Update user progress
- `GET /api/progress/{topicId}` - Get specific topic progress

**Problems:**
- `GET /api/problems` - Get practice problems
- `GET /api/problems/{id}` - Get specific problem

**Solutions:**
- `GET /api/solutions` - Get user solutions
- `POST /api/solutions` - Save user solution

## Key Differences

### Authentication
- **Before**: Replit OAuth with sessions
- **After**: JWT tokens stored in localStorage

### User Management
- **Before**: Users created automatically via Replit
- **After**: Manual registration with email/password

### API Structure
- **Before**: Express.js with custom middleware
- **After**: Spring Boot with Spring Security

## Testing the Migration

1. Start the Spring Boot backend
2. Register a new user account
3. Login and verify JWT token is stored
4. Test the stack visualization page
5. Verify progress tracking works

## Rollback Plan

If you need to rollback to the Node.js backend:
1. Stop the Spring Boot application
2. Restart the Node.js application: `npm run dev`
3. The database remains compatible with both backends

## Production Deployment

For production deployment:
1. Build the Spring Boot JAR: `./mvnw clean package`
2. Deploy the JAR file to your hosting platform
3. Set environment variables for production
4. Update frontend to point to the new backend URL

## Benefits of Spring Boot Backend

1. **Better Performance**: JVM optimization and Spring's efficient request handling
2. **Enterprise Features**: Built-in security, monitoring, and deployment options
3. **Type Safety**: Strong typing with Java reduces runtime errors
4. **Ecosystem**: Rich Spring ecosystem for future features
5. **Scalability**: Better horizontal scaling capabilities

## Next Steps

1. Test the new authentication flow
2. Verify all existing features work with the new backend
3. Add any missing features or endpoints
4. Deploy to production when ready

The React frontend remains largely unchanged, making this migration straightforward while providing a more robust backend foundation.