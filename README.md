# Image Generator API

API untuk generate gambar menggunakan Puppeteer dan menyimpan hasil ke folder temp.

## Struktur Project

```
image-gen/
├── index.js              # Main server file
├── package.json          # Dependencies
├── routes/              # Route handlers
│   └── generate.js      # Generate image routes
├── services/            # Business logic
│   └── imageGenerator.js # Image generation service
├── utils/               # Utility functions
│   └── imageSaver.js    # Image saving utilities
└── temp/                # Generated images storage
```

## API Endpoints

### Generate Image
- **POST** `/generate`
- **Body**: 
  ```json
  {
    "prompt": "your image prompt here"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Generate berhasil!",
    "data": {
      "url": "https://chat.qwen.ai/c/guest",
      "prompt": "your prompt",
      "originalImageSrc": "original_image_url",
      "savedImage": {
        "filename": "generated_1234567890.jpg",
        "filePath": "temp/generated_1234567890.jpg",
        "fullPath": "C:\\path\\to\\temp\\generated_1234567890.jpg",
        "downloadUrl": "http://localhost:3001/temp/generated_1234567890.jpg"
      }
    }
  }
  ```

### Get Saved Images
- **GET** `/generate/saved`
- **Response**: List of all saved images in temp folder

### Static Files
- **GET** `/temp/{filename}` - Access saved images directly

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Generate an image:
   ```bash
   curl -X POST http://localhost:3001/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "a beautiful sunset over mountains"}'
   ```

3. View saved images:
   ```bash
   curl http://localhost:3001/generate/saved
   ```

4. Access image directly:
   ```
   http://localhost:3001/temp/generated_1234567890.jpg
   ```

## Features

- ✅ Clean code structure with separation of concerns
- ✅ Automatic image download and saving to temp folder
- ✅ Static file serving for generated images
- ✅ List all saved images
- ✅ Proper error handling
- ✅ Detailed logging
