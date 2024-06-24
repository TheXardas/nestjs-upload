
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
- DELETE /private/:version
  This endpoint should delete file from the storage by provided version
- GET /public/:version
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
- Monitoring
- Old unused file cleaner job
- Linting and testing pre-commit hooks

## Hot to run it

You should have git and docker pre-installed. It's easier to check how application works with Postman.

```bash
git clone git@github.com:TheXardas/nestjs-upload.git
cd nestjs-upload
docker compose up
```
After a little while, application with run on http://localhost:8080

Swagger can be used here: http://localhost:8080/api But **beware**!
In chrome you should allow file upload on uknown sites, or it won't work.

You can also import files in **postman** folder (not the folder though) from project root into your Postman app, to test it out.

To authorize, use **/auth/login** endpoint. You can use following body (user is already created):
```json
{"login":"admin","password":"admin"}
```
Endpoint will return new **JWT token**, which could be now used for /admin endpoints in postman ACCESS_TOKEN variable.

To edit files and versions use **/admin** endpoints:
- POST /admin/upload - Create file. This will return fileId and first file versionId)
- POST /admin/upload/:fileId - Create file version
- DELETE /admin/file/:fileId - Delete file
- DELETE /admin/version/:versionId - Delete file version. If all versions are delete, file is removed automatically.
- GET /admin/history - List all files and their versions

To download files, use public **/download** endpoint:
- GET /download/:versionId - Returns file, corresponding to provided version.

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
