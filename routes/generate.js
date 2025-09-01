import express from 'express';
import { ImageGeneratorService } from '../services/imageGenerator.js';
import { ImageSaver } from '../utils/imageSaver.js';

const router = express.Router();
const imageGenerator = new ImageGeneratorService();
const imageSaver = new ImageSaver();

router.post('/', async (req, res) => {
  const url = process.env.API_URL || "https://chat.qwen.ai/c/guest";
  const { prompt } = req.body || {};

  if (!url || !prompt) {
    console.log("❌ URL atau prompt tidak ada");
    return res.status(400).json({ 
      success: false,
      error: "url dan prompt wajib ada" 
    });
  }

  try {
    // Generate gambar
    const result = await imageGenerator.generateImage(url, prompt);
    
    // Download dan simpan gambar ke folder temp
    console.log("💾 Menyimpan gambar ke folder temp...");
    const savedImage = await imageSaver.downloadAndSave(result.imageSrc);

    // Return response dengan informasi file yang disimpan
    res.json({
      success: true,
      message: "Generate berhasil!",
      data: {
        url: result.url,
        prompt: result.prompt,
        originalImageSrc: result.imageSrc,
        savedImage: {
          filename: savedImage.filename,
          filePath: savedImage.relativePath,
          fullPath: savedImage.filePath,
          downloadUrl: `http://localhost:3001/${savedImage.relativePath}`
        }
      }
    });

  } catch (error) {
    console.error("❌ Terjadi error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route untuk mendapatkan daftar gambar yang sudah disimpan
router.get('/saved', (req, res) => {
  try {
    const files = imageSaver.listFiles();
    const fileDetails = files.map(filename => {
      const stats = imageSaver.getFileStats(filename);
      return {
        filename,
        relativePath: `temp/${filename}`,
        downloadUrl: `http://localhost:3001/temp/${filename}`,
        ...stats
      };
    });

    res.json({
      success: true,
      message: `Ditemukan ${files.length} gambar tersimpan`,
      data: fileDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
