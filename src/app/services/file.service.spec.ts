import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../common/services/prisma.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import FileService from './file.service';
import { FileSystemService } from './file-system.service';
import { ConfigService } from '@nestjs/config';

describe('FileService', () => {
  let prisma;
  let fileService: FileService;
  let fileSystemService;
  let configService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [FileService, FileSystemService, PrismaService, ConfigService],
    })
      .overrideProvider(FileSystemService)
      .useValue(mockDeep<FileSystemService>())
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(ConfigService)
      .useValue(mockDeep<ConfigService>())
      .compile();

    prisma = app.get(PrismaService);
    fileService = app.get(FileService);
    fileSystemService = app.get(FileSystemService);
    configService = app.get(ConfigService);
    configService.get.mockImplementation(() => './testPath');
  });

  it('createFile should create a file, version and save it', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.create.mockResolvedValueOnce({ id: 333 });
    prisma.fileVersion.create.mockResolvedValueOnce({ id: 'ver1' });
    const dataBuffer = Buffer.from('hi', 'utf8');

    await fileService.createFile('testFile', 321, 'fileType', dataBuffer);

    expect(prisma.$transaction.mock.calls).toHaveLength(1);
    expect(prisma.file.create.mock.calls).toHaveLength(1);
    expect(prisma.file.create.mock.calls[0][0].data).toMatchObject({
      name: 'testFile',
      mimeType: 'fileType',
      createdById: 321,
    });
    expect(prisma.fileVersion.create.mock.calls).toHaveLength(1);
    expect(prisma.fileVersion.create.mock.calls[0][0].data).toMatchObject({
      fileId: 333,
      createdById: 321,
    });
    expect(fileSystemService.saveFile.mock.calls).toHaveLength(1);
    expect(fileSystemService.saveFile.mock.calls[0]).toMatchObject([
      './testPath/ver1',
      dataBuffer,
    ]);
  });

  it('createFile should not create a file, if there is an error', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.create.mockResolvedValueOnce({ id: 333 });
    prisma.fileVersion.create.mockImplementation(() => {
      throw new Error('Test!');
    });

    await expect(
      fileService.createFile(
        'testFile',
        321,
        'fileType',
        Buffer.from('hi', 'utf8'),
      ),
    ).rejects.toThrow('Test!');

    expect(prisma.$transaction.mock.calls).toHaveLength(1);
    expect(prisma.file.create.mock.calls).toHaveLength(1);
    expect(prisma.fileVersion.create.mock.calls).toHaveLength(1);
    expect(fileSystemService.saveFile.mock.calls).toHaveLength(0);
  });

  it('updateFileVersion should create new version for a file', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.findUnique.mockResolvedValueOnce({
      id: 321,
      mimeType: 'fileType',
    });
    prisma.fileVersion.create.mockResolvedValueOnce({ id: 222 });

    const dataBuffer = Buffer.from('hi', 'utf8');

    expect(
      await fileService.updateFileVersion(321, 333, 'fileType', dataBuffer),
    ).toMatchObject({ fileId: 321, versionId: 222 });

    expect(prisma.$transaction.mock.calls).toHaveLength(1);
    expect(prisma.file.create.mock.calls).toHaveLength(0);
    expect(prisma.fileVersion.create.mock.calls).toHaveLength(1);
    expect(prisma.fileVersion.create.mock.calls[0][0].data).toMatchObject({
      fileId: 321,
      createdById: 333,
    });
    expect(fileSystemService.saveFile.mock.calls).toHaveLength(1);
    expect(fileSystemService.saveFile.mock.calls[0]).toMatchObject([
      './testPath/222',
      dataBuffer,
    ]);
  });

  it('updateFileVersion should validate file existance', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.findUnique.mockResolvedValueOnce();

    const dataBuffer = Buffer.from('hi', 'utf8');

    await expect(
      fileService.updateFileVersion(321, 333, 'fileType', dataBuffer),
    ).rejects.toThrow('Not Found');

    expect(prisma.$transaction.mock.calls).toHaveLength(1);
    expect(prisma.file.create.mock.calls).toHaveLength(0);
    expect(prisma.fileVersion.create.mock.calls).toHaveLength(0);
    expect(fileSystemService.saveFile.mock.calls).toHaveLength(0);
  });

  it('updateFileVersion should validate mimeType', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.findUnique.mockResolvedValueOnce({ id: 321, mimeType: 'fileType' });

    const dataBuffer = Buffer.from('hi', 'utf8');

    await expect(
      fileService.updateFileVersion(321, 333, 'wrongFileType', dataBuffer),
    ).rejects.toThrow('Mime type of file does not match with stored.');

    expect(prisma.$transaction.mock.calls).toHaveLength(1);
    expect(prisma.file.create.mock.calls).toHaveLength(0);
    expect(prisma.fileVersion.create.mock.calls).toHaveLength(0);
    expect(fileSystemService.saveFile.mock.calls).toHaveLength(0);
  });

  it('deleteFile should delete all versions', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.findUnique.mockResolvedValueOnce({ id: 321, mimeType: 'fileType' });
    prisma.fileVersion.findMany.mockResolvedValueOnce([{ id: 'ver1' }, { id: 'ver5' }, { id: 'ver10' }]);

    await fileService.deleteFile(321);

    expect(fileSystemService.removeFile.mock.calls).toHaveLength(3);
    expect(fileSystemService.removeFile.mock.calls.map((c) => c[0]))
      .toMatchObject(['./testPath/ver1', './testPath/ver5', './testPath/ver10']);
    expect(prisma.fileVersion.deleteMany.mock.calls).toHaveLength(1);
    expect(prisma.fileVersion.deleteMany.mock.calls[0][0]).toMatchObject({ where: { fileId: 321 } });
    expect(prisma.file.delete.mock.calls).toHaveLength(1);
    expect(prisma.file.delete.mock.calls[0][0]).toMatchObject({ where: { id: 321 } });
  });

  it('deleteFileVersion should delete version only', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.findUnique.mockResolvedValueOnce({ id: 321, mimeType: 'fileType' });
    prisma.fileVersion.findUnique.mockResolvedValueOnce({ id: 'ver15' });
    prisma.fileVersion.count.mockResolvedValueOnce(3);

    await fileService.deleteFileVersion('ver15');

    expect(fileSystemService.removeFile.mock.calls).toHaveLength(1);
    expect(fileSystemService.removeFile.mock.calls[0][0]).toMatch('./testPath/ver15');
    expect(prisma.fileVersion.delete.mock.calls).toHaveLength(1);
    expect(prisma.fileVersion.delete.mock.calls[0][0]).toMatchObject({ where: { id: 'ver15' } });
    expect(prisma.file.delete.mock.calls).toHaveLength(0);
  });

  it('deleteFileVersion should delete file with last version', async () => {
    prisma.$transaction.mockImplementation((cb) => cb(prisma));
    prisma.file.findUnique.mockResolvedValueOnce({ id: 321, mimeType: 'fileType' });
    prisma.fileVersion.findUnique.mockResolvedValueOnce({ id: 'ver15', fileId: 321 });
    prisma.fileVersion.count.mockResolvedValueOnce(0);

    await fileService.deleteFileVersion('ver15');

    expect(fileSystemService.removeFile.mock.calls).toHaveLength(1);
    expect(fileSystemService.removeFile.mock.calls[0][0]).toMatch('./testPath/ver15');
    expect(prisma.fileVersion.delete.mock.calls).toHaveLength(1);
    expect(prisma.fileVersion.delete.mock.calls[0][0]).toMatchObject({ where: { id: 'ver15' } });
    expect(prisma.file.delete.mock.calls).toHaveLength(1);
    expect(prisma.file.delete.mock.calls[0][0]).toMatchObject({ where: { id: 321 } });
  });
});
