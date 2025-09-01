import fs from 'fs';
import path from 'path';
import axios from 'axios';

export class ImageSaver {
  constructor(tempDir = 'temp') {
    this.tempDir = tempDir;
    this.ensureTempDirExists();
  }

  ensureTempDirExists() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
      console.log(`📁 Folder ${this.tempDir} berhasil dibuat`);
    }
  }

  generateFileName(prefix = 'generated', extension = 'jpg') {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}.${extension}`;
  }

  async downloadAndSave(imageUrl, filename = null) {
    try {
      console.log(`📥 Mendownload gambar dari: ${imageUrl}`);
      
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream'
      });

      // Generate filename jika tidak diberikan
      if (!filename) {
        const urlExtension = this.getImageExtensionFromUrl(imageUrl);
        filename = this.generateFileName('generated', urlExtension);
      }

      const filePath = path.join(this.tempDir, filename);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ Gambar berhasil disimpan: ${filePath}`);
          resolve({
            success: true,
            filePath: filePath,
            filename: filename,
            relativePath: `temp/${filename}`
          });
        });

        writer.on('error', (error) => {
          console.error(`❌ Error saat menyimpan gambar: ${error.message}`);
          reject(error);
        });
      });

    } catch (error) {
      console.error(`❌ Error saat download gambar: ${error.message}`);
      throw error;
    }
  }

  getImageExtensionFromUrl(url) {
    // Coba ekstrak ekstensi dari URL
    const urlPath = new URL(url).pathname;
    const extension = path.extname(urlPath).slice(1);
    
    // Default ke jpg jika tidak ada ekstensi atau ekstensi tidak valid
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return validExtensions.includes(extension.toLowerCase()) ? extension : 'jpg';
  }

  getFileStats(filename) {
    const filePath = path.join(this.tempDir, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }
    return { exists: false };
  }

  listFiles() {
    try {
      const files = fs.readdirSync(this.tempDir);
      return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      });
    } catch (error) {
      console.error(`❌ Error saat membaca folder ${this.tempDir}: ${error.message}`);
      return [];
    }
  }
}
