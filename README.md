# MIT Clubs

A modern web platform for discovering and managing MIT student clubs.

## Project Structure

```
mit-clubs/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── auth/        # OIDC authentication
│   │   ├── components/  # React components
│   │   └── assets/      # Images and static files
│   └── index.html
│
├── server/              # backend Node.js server
│   └── src/
│       ├── api/         # Route handlers
│       ├── auth/        # Authentication logic
│       ├── models/      # Database schemas
│       ├── services/    # Business logic
│       └── tools/       # Utilities
│
├── client.Dockerfile    # Frontend Docker configuration
├── server.Dockerfile    # Backend Docker configuration
├── docker-compose.yml   # Multi-container orchestration
├── Jenkinsfile          # CI/CD pipeline configuration
```
