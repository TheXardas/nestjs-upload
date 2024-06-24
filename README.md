
## TODO
- Tests
- Docs
- Check docker compose
- Monitoring
- Old unused file cleaner job
- Fix file upload in swagger
- Include postman collection

/**
Technical task:
Test task:
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
*/

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```