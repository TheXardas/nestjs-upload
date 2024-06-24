import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import FileService from '../services/file.service';
import { AuthGuard } from '../guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthorizedRequest } from '../contants';

const imageValidator = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
    new FileTypeValidator({
      fileType: new RegExp(
        /image\/png|image\/jpeg|imagesvg\+xml|image\/gif|image\/svg\+xml/,
      ),
    }),
  ],
});

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

const fileApiBody = {
  description: 'File upload',
  type: FileUploadDto,
};

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly fileService: FileService) {}

  @Get('history')
  getFileHistory() {
    return this.fileService.getFileHistory();
  }

  @Post('upload/:fileId')
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileApiBody)
  @UseInterceptors(FileInterceptor('file'))
  replaceFileVersion(
    @UploadedFile(imageValidator) file: Express.Multer.File,
    @Param('fileId') fileId: string,
    @Req() req: AuthorizedRequest,
  ) {
    return this.fileService.updateFileVersion(
      Number(fileId),
      req.user.id,
      file.mimetype,
      file.buffer,
    );
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody(fileApiBody)
  @UseInterceptors(FileInterceptor('file'))
  async createFileVersion(
    @UploadedFile(imageValidator)
    file: Express.Multer.File,
    @Req() req: AuthorizedRequest,
  ) {
    return await this.fileService.createFile(
      file.originalname,
      req.user.id,
      file.mimetype,
      file.buffer,
    );
  }

  @Delete('version/:versionId')
  deleteFileVersion(@Param('versionId') versionId: string) {
    return this.fileService.deleteFileVersion(versionId);
  }

  @Delete('file/:fileId')
  deleteFile(@Param('fileId') fileId: number) {
    return this.fileService.deleteFile(fileId);
  }
}
