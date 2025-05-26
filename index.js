import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());

app.get("/api", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector("video");
      return video ? video.src : null;
    });

    await browser.close();

    if (!videoUrl) return res.json({ error: "Video not found" });

    return res.json({ videoUrl });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));
