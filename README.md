
# NestJS File Upload Test Task service

## Task requirements

Create a Nest.js application that should has public and private endpoints.
Private endpoints should be protected by auth method.
Public endpoint allows to read the data and private allows to write data.
The application should be dockerized.
POST /private
This endpoint should accept any binary image and move it into file storage

Requirements:
- The file must be versioned
- History of file changes should be kept
  DELETE /private/:version
  This endpoint should delete file from the storage by provided version
  GET /public/:version
  This endpoint should respond with the file data

Evaluation criteria:
- Clean code, which is self documented
- Code structure, design
- Tests, documentation
- Your application should works

During the face to face interview you will have the opportunity
to explain your design choices and provide justifications for
the parts that you omitted

## Solution approach
- Two modules: common and app, for segregation of common/feature logic.
- Further feature moduling possible, if app codebase becomes too big.
- Files categorized by their function.
- Postgresql and Prisma are used for data storage
- JWT token with nestjs AuthGuard is used for authorization
- Uploaded files are stored directly in filesystem, but destination is easily replaceable for production.
- Main features (authorization and file upload) are tested.
- You can drag n drop postman folder into your Postman app to rapidly test service api, run by docker-compose.

## TODO
- More tests
- Fix swagger file upload
- Monitoring
- Old unused file cleaner job

## Useful commands

```bash
# start
npm run start:dev

# run migrations and build (used in docker)
npm run start:migrate:prod

# generate prisma models
npm run prisma:generate

# migrate database
npm run prisma:migrate

# creates user admin:admin in database for tests
npm run create-test-user
```
