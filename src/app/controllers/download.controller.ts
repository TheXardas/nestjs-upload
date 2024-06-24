import { Controller, Get, Param, Res } from '@nestjs/common';
import FileService from '../services/file.service';
import { Response } from 'express';

@Controller('download')
export class DownloadController {
  constructor(private readonly fileService: FileService) {}

  @Get(':versionId')
  downloadFileVersion(
    @Param('versionId') versionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.fileService.download(versionId, res);
  }
}
