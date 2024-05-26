require('dotenv').config();
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Pusher = require('pusher');

const app = express();
const port = 3002;

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

const tmpDir = path.join(__dirname, 'tmp');
const fileExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Ensure the tmp directory exists
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Cleanup function to delete old files
function cleanupOldFiles() {
  const now = Date.now();
  fs.readdir(tmpDir, (err, files) => {
    if (err) {
      console.error('Error reading tmp directory:', err);
      return;
    }
    files.forEach(file => {
      const filePath = path.join(tmpDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        if (now - stats.mtimeMs > fileExpirationTime) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log(`Deleted old file: ${filePath}`);
            }
          });
        }
      });
    });
  });
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000); // 1 hour in milliseconds

app.get('/', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('m3u8 URL is required');
  }

  const fileId = uuidv4();
  const filename = `${fileId}.mp4`;
  const outputPath = path.join(tmpDir, filename);

  const pusherKey = process.env.PUSHER_KEY;
  const pusherCluster = process.env.PUSHER_CLUSTER;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HLS to Video File by VidBinge</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body class="bg-[#000A12] flex items-center justify-center min-h-screen">
      <div class="bg-[#1D1728] p-8 rounded-lg shadow-lg text-center mx-2 md:mx-0">
        <h1 class="text-2xl text-white text-pretty font-bold mb-4">HLS to Video Conversion powered by VidBinge</h1>
        <h2 class="text-xl text-white font-bold mb-4">Conversion Progress</h2>
        <div class="flex w-full h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
          <div id="progress-bar" class="flex flex-col justify-center rounded-full overflow-hidden bg-[#8652bb] text-xs text-white text-center whitespace-nowrap transition duration-500" style="width: 0%"></div>
        </div>
        <div id="status" class="mt-2 text-lg text-white">Starting...</div>
        <div id="download-link" class="mt-4 text-[#8652bb] hidden"><a class="font-bold hover:text-underline" href="/download?fileId=${fileId}" target="">Download doesn't start automatically? Click here to download</a></div>
      </div>
      <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
      <script>
        Pusher.logToConsole = true;

        var pusher = new Pusher('${pusherKey}', {
          cluster: '${pusherCluster}'
        });

        var channel = pusher.subscribe('file-conversion-${fileId}');
        channel.bind('progress', function(data) {
          const progressBar = document.getElementById('progress-bar');
          const statusText = document.getElementById('status');
          const downloadLink = document.getElementById('download-link');
          const progress = data.progress;
          if (progress === 'error') {
            statusText.innerText = 'Error converting file. Please check the m3u8 URL and try again.';
          } else {
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', progress);
            if (progress === 100) {
              statusText.innerText = 'Conversion complete! Starting download...';
              downloadLink.classList.remove('hidden');
              setTimeout(() => {
                window.location.href = '/download?fileId=${fileId}';
              }, 1000);
            } else {
              statusText.innerText = \`Conversion progress: \${progress}%\`;
            }
          }
        });
      </script>
    </body>
    </html>
  `);

  const ffmpegProcess = ffmpeg(url)
    .on('progress', (progress) => {
      const percent = Math.floor(progress.percent);
      pusher.trigger(`file-conversion-${fileId}`, 'progress', { progress: percent });
    })
    .on('end', () => {
      pusher.trigger(`file-conversion-${fileId}`, 'progress', { progress: 100 });
      console.log(`File converted: ${filename}`);
    })
    .on('error', (error) => {
      console.error('Error converting file:', error);
      pusher.trigger(`file-conversion-${fileId}`, 'progress', { progress: 'error' });
    })
    .outputOptions('-c copy')
    .outputOptions('-bsf:a aac_adtstoasc')
    .output(outputPath)
    .run();
});

app.get('/download', (req, res) => {
  const fileId = req.query.fileId;
  const filePath = path.join(tmpDir, `${fileId}.mp4`);
  
  if (!fileId || !fs.existsSync(filePath)) {
    return res.status(400).send('Invalid file ID.');
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});