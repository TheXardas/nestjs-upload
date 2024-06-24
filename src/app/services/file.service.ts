import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Config } from '../contants';
import { Response } from 'express';
import { Prisma } from '@prisma/client/extension';
import TransactionClient = Prisma.TransactionClient;
import { FileSystemService } from './file-system.service';

@Injectable()
export default class FileService {
  constructor(
    private db: PrismaService,
    private configService: ConfigService<Config>,
    private fileSystemService: FileSystemService,
  ) {}

  private get path() {
    return this.configService.get('UPLOAD_LOCATION');
  }

  async createFile(
    fileName: string,
    userId: number,
    mimeType: string,
    file: Buffer,
  ) {
    let fileModel;
    let fileVersion;
    await this.db.$transaction(async (tx) => {
      fileModel = await tx.file.create({
        data: { name: fileName, mimeType, createdById: userId },
      });
      fileVersion = await this.createFileVersion(
        tx,
        fileModel.id,
        userId,
        file,
      );
    });
    return {
      fileId: fileModel.id,
      versionId: fileVersion.id,
    };
  }

  async createFileVersion(
    tx: TransactionClient,
    fileId: number,
    userId: number,
    buffer: Buffer,
  ) {
    const fileVersion = await tx.fileVersion.create({
      data: {
        fileId,
        createdById: userId,
      },
    });

    this.fileSystemService.saveFile(this.path + '/' + fileVersion.id, buffer);

    return fileVersion;
  }

  async updateFileVersion(
    fileId: number,
    userId: number,
    mimeType: string,
    buffer: Buffer,
  ) {
    let fileModel;
    let fileVersion;
    await this.db.$transaction(async (tx) => {
      fileModel = await tx.file.findUnique({
        where: { id: fileId },
      });
      if (!fileModel) {
        throw new NotFoundException();
      }
      if (fileModel.mimeType !== mimeType) {
        throw new BadRequestException(
          'Mime type of file does not match with stored.',
        );
      }
      fileVersion = await this.createFileVersion(
        tx,
        fileModel.id,
        userId,
        buffer,
      );
    });
    return {
      fileId: fileModel.id,
      versionId: fileVersion.id,
    };
  }

  async deleteFileVersion(versionId: string) {
    await this.db.$transaction(async (tx) => {
      const fileVersion = await tx.fileVersion.findUnique({
        where: { id: versionId },
      });
      if (!fileVersion) {
        throw new NotFoundException();
      }

      const fileId = fileVersion.fileId;

      await tx.fileVersion.delete({ where: { id: versionId } });

      const versionsCount = await tx.fileVersion.count({
        where: { fileId },
      });
      if (versionsCount === 0) {
        await tx.file.delete({ where: { id: fileId } });
      }

      this.fileSystemService.removeFile(this.path + '/' + fileVersion.id);
    });
    return versionId;
  }

  async download(versionId: string, res: Response) {
    const fileVersion = await this.db.fileVersion.findUnique({
      select: { id: true, file: true },
      where: { id: versionId },
    });
    if (!fileVersion) {
      throw new NotFoundException();
    }

    res.set({
      'Content-Type': fileVersion.file.mimeType,
      'Content-Disposition': `attachment; filename="${fileVersion.file.name}"`,
    });

    if (!this.fileSystemService.fileExists(this.path + '/' + fileVersion.id)) {
      throw new NotFoundException();
    }

    const stream = this.fileSystemService.readFile(
      this.path + '/' + fileVersion.id,
    );
    return new StreamableFile(stream);
  }

  getFileHistory() {
    return this.db.file.findMany({
      select: {
        id: true,
        name: true,
        mimeType: true,
        versions: { select: { id: true, createdAt: true } },
      },
    });
  }
}
