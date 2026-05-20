import express from 'express';
import cors from 'cors';
import { getSubtitles } from 'youtube-caption-extractor';

const app = express();
app.use(cors());
app.use(express.json());

async function translateTextToThai(text) {
  try {
    const url = `https://googleapis.com{encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    return data && data ? data.map(item => item).join('') : text;
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
}



function extractYouTubeId(url) {
  const parseRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
  const matchResult = url.match(parseRegex);
  return (matchResult && matchResult) ? matchResult : null;
}

app.post('/api/transcribe', async (req, res) => {
  const { url } = req.body;
  const videoId = extractYouTubeId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    let internalTracks = [];
    let needsTranslation = false;
    try {
      internalTracks = await getSubtitles({ videoID: videoId, lang: 'th' });
    } catch (thError) {
      internalTracks = await getSubtitles({ videoID: videoId, lang: 'en' });
      needsTranslation = true;
    }

    const formattedSegments = await Promise.all(internalTracks.map(async (item) => {
      let textContent = item.text;
      if (needsTranslation) textContent = await translateTextToThai(item.text);
      return {
        start: parseFloat(item.start),
        end: parseFloat(item.start) + parseFloat(item.dur),
        text: textContent
      };
    }));

    return res.json({ title: "Synchronized Transcript Session", segments: formattedSegments });
  } catch (err) {
    return res.status(500).json({ error: "No captions found on this video." });
  }
const PORT_APP = process.env.PORT || 5000;
app.listen(PORT_APP, () => console.log(`🚀 Automated Translation Backend running on port ${PORT_APP}`));
