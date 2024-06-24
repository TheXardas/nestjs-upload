import * as path from 'path';
import * as fs from 'fs';

export class FileSystemService {
  constructor() {}

  readFile(filePath: string) {
    return fs.createReadStream(filePath);
  }

  saveFile(filePath: string, buffer: Buffer) {
    const directory = path.dirname(filePath);
    if (!this.fileExists(directory)) this.makeDir(directory);
    fs.writeFileSync(filePath, buffer);
  }

  removeFile(filePath: string) {
    return fs.unlinkSync(filePath);
  }

  fileExists(filePath: string) {
    return fs.existsSync(filePath);
  }

  makeDir(filePath: string) {
    return fs.mkdirSync(filePath);
  }
}