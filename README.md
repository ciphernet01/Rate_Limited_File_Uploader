# Resilient Core API

A secure, modular RESTful API for a hypothetical multi-tenant Project Management module, built with Node.js and Express.

## Features

- JWT-based authentication with registration and login
- Multi-tenant project CRUD with owner-only modification rules
- Rate-limited file upload endpoint (`5 uploads / minute` per user/IP)
- Multipart upload validation for plain-text `.txt` and `.csv` files only
- Upload response metadata: file name, file size, and total word count
- Request validation with `express-validator`
- Layered structure with routes, controllers, services, repositories, and middleware
- Simple JSON-backed persistence for local evaluation and free-host deployment demos

## Tech Stack

- Node.js
- Express
- JSON Web Tokens (`jsonwebtoken`)
- Password hashing with `bcryptjs`
- `express-validator`, `helmet`, `cors`, `morgan`

## Project Structure

- [src/app.js](src/app.js)
- [src/server.js](src/server.js)
- [src/routes](src/routes)
- [src/controllers](src/controllers)
- [src/services](src/services)
- [src/repositories](src/repositories)
- [src/middlewares](src/middlewares)

## Environment Variables

Copy `.env.example` to `.env` and update values:

- `PORT` - server port
- `JWT_SECRET` - signing secret for JWT tokens
- `JWT_EXPIRES_IN` - token TTL
- `DATA_FILE` - JSON storage path
- `CORS_ORIGIN` - allowed origin

## Run Locally

1. Install dependencies:
   - `npm install`
2. Create your environment file:
   - copy `.env.example` to `.env`
3. Start the API:
   - `npm run dev`

Production start:

- `npm start`

Health endpoint:

- `GET /api/health`

Run tests:

- `npm test`

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

Register body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "tenantId": "tenant-acme"
}
```

Login body:

```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

### Projects

All project routes require `Authorization: Bearer <token>`.

- `GET /api/projects`
- `GET /api/projects/:projectId`
- `POST /api/projects`
- `PUT /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`

Create project body:

```json
{
  "title": "Launch v2",
  "description": "Coordinate release work across teams.",
  "status": "planned"
}
```

Allowed statuses:

- `planned`
- `in-progress`
- `completed`
- `archived`

### Uploads

- `POST /api/uploads`
- Content type: `multipart/form-data`
- File field name: `file`
- Accepted file types: `.txt`, `.csv`
- Rate limit: maximum `5` uploads per minute per user/IP

Success response example:

```json
{
  "success": true,
  "data": {
    "fileName": "report.txt",
    "fileSize": 128,
    "wordCount": 24
  }
}
```

Rate-limit response:

- HTTP `429 Too Many Requests`

Upload example with curl:

```bash
curl -X POST http://localhost:3000/api/uploads \
  -F "file=@./sample.txt"
```

## Security Model

- JWT tokens identify the authenticated user and tenant
- Project ownership is enforced in the service layer
- Cross-tenant access is denied
- `ownerId` and `tenantId` are server-assigned, not client-controlled

## Deployment

This codebase is ready for deployment on Render or Railway:

1. Push this project to a public GitHub repository.
2. Create a new web service.
3. Set the build command to `npm install`.
4. Set the start command to `npm start`.
5. Configure environment variables from `.env.example`.

## Submission

- **Live URL:** https://resilient-core-api.onrender.com
- **Public GitHub Repository:** https://github.com/ciphernet01/resilient-core-api
