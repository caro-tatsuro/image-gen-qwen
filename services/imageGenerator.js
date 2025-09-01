import puppeteer from "puppeteer";

export class ImageGeneratorService {
  constructor() {
    this.browser = null;
  }

  async generateImage(url, prompt) {
    console.log("📥 Request diterima:");
    console.log(`   URL: ${url}`);
    console.log(`   Prompt: ${prompt}`);

    if (!url || !prompt) {
      throw new Error("URL dan prompt wajib ada");
    }

    try {
      console.log("🚀 Memulai browser Puppeteer...");
      this.browser = await puppeteer.launch({
        // headless: false, // Matikan headless mode agar browser terlihat
        // devtools: false, // Set true jika ingin dev tools terbuka
        // slowMo: 20, // Tambahkan delay lebih besar untuk stabilitas
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security", // Untuk menghindari CORS issues
          "--start-maximized", // Browser akan terbuka dalam mode maximized
          "--disable-blink-features=AutomationControlled", // Menghindari deteksi bot
        ],
      });
      console.log("✅ Browser berhasil diluncurkan");

      const page = await this.browser.newPage();
      console.log("✅ Page baru berhasil dibuat");
      
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari"
      );
      await page.setViewport({ width: 1366, height: 768 });
      console.log("✅ User agent dan viewport berhasil diset");

      // Buka halaman
      console.log(`🌐 Membuka URL: ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      console.log("✅ Halaman berhasil dimuat");

      // Tunggu dan klik button chat-prompt-suggest-button index ke-3
      console.log("🔍 Mencari button chat-prompt-suggest-button...");
      await page.waitForSelector(".chat-prompt-suggest-button", {
        timeout: 30_000,
      });
      console.log("✅ Button chat-prompt-suggest-button ditemukan");

      // Tunggu sebentar untuk memastikan DOM stabil
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Gunakan evaluate untuk klik yang lebih stabil
      const buttonCount = await page.evaluate(() => {
        const buttons = document.querySelectorAll(".chat-prompt-suggest-button");
        return buttons.length;
      });
      console.log(
        `📊 Ditemukan ${buttonCount} button chat-prompt-suggest-button`
      );

      if (buttonCount > 3) {
        console.log("🖱️ Mengklik button index ke-3 (yang ke-4)...");
        await page.evaluate(() => {
          const buttons = document.querySelectorAll(
            ".chat-prompt-suggest-button"
          );
          buttons[3].click();
        });
        console.log("✅ Button index ke-3 berhasil diklik");
      } else {
        console.log(
          `❌ Hanya ada ${buttonCount} button, tidak bisa klik index ke-3`
        );
      }

      // Cari textarea dengan id chat-input dan ketik prompt
      console.log("🔍 Mencari textarea dengan id chat-input...");
      await page.waitForSelector("#chat-input", { timeout: 30_000 });
      console.log("✅ Textarea chat-input ditemukan");

      console.log("🖱️ Mengklik textarea untuk focus...");
      await page.click("#chat-input");
      console.log("✅ Textarea berhasil diklik");

      // Bersihkan prompt dari karakter newline untuk menghindari submit tidak diinginkan
      const cleanPrompt = String(prompt).replace(/\\n/g, ' ').replace(/\n/g, ' ').trim();
      console.log(`⌨️ Mengetik prompt: "${cleanPrompt}"`);
      await page.type("#chat-input", cleanPrompt, { delay: 10 });
      console.log("✅ Prompt berhasil diketik");

      // Tekan Enter untuk submit
      console.log("⌨️ Menekan Enter...");
      await page.keyboard.press("Enter");
      console.log("✅ Enter berhasil ditekan, proses generate dimulai");

      // Tunggu hingga gambar hasil muncul
      console.log("🖼️ Menunggu gambar hasil generate...");
      console.log("⏳ Ini mungkin memakan waktu hingga 2 menit...");

      const imgSelector = ".vlo-image-content img[src]";
      await page.waitForSelector(imgSelector, { timeout: 240_000 }); // tunggu hingga 4 menit
      console.log("✅ Gambar hasil berhasil ditemukan!");

      // Ambil src gambar
      const imgSrc = await page.$eval(imgSelector, (img) =>
        img.getAttribute("src")
      );
      console.log(`🔗 URL gambar hasil (asli): ${imgSrc}`);

      // Hilangkan parameter x-oss-process dari URL
      const cleanImgSrc = imgSrc.replace(/&x-oss-process=image\/resize[^&]*/, '');
      console.log(`🔗 URL gambar hasil (bersih): ${cleanImgSrc}`);

      console.log("🎉 Proses generate selesai!");
      
      return {
        url: url,
        prompt: prompt,
        imageSrc: cleanImgSrc,
      };
    } catch (error) {
      console.error("❌ Terjadi error:", error.message);
      console.error("📍 Stack trace:", error.stack);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  async closeBrowser() {
    if (this.browser) {
      console.log("🔄 Menutup browser...");
      // await this.browser.close();
      console.log("✅ Browser berhasil ditutup");
    }
  }
}
