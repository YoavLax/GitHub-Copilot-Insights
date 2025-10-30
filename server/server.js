const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const STORAGE_PATH = process.env.STORAGE_PATH || '/data';
const METRICS_FILE = path.join(STORAGE_PATH, 'latest-metrics.ndjson');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directory:', error);
  }
}

ensureStorageDir();

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Copy file to persistent storage (can't use rename across different filesystems)
    await fs.copyFile(req.file.path, METRICS_FILE);
    
    // Clean up temporary file
    await fs.unlink(req.file.path).catch(err => console.error('Failed to delete temp file:', err));

    res.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get latest metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const exists = await fs.access(METRICS_FILE).then(() => true).catch(() => false);
    
    if (!exists) {
      return res.json({ data: null });
    }

    // Stream the file instead of loading it all into memory
    const fileStream = require('fs').createReadStream(METRICS_FILE, 'utf-8');
    let content = '';
    
    fileStream.on('data', (chunk) => {
      content += chunk;
    });
    
    fileStream.on('end', () => {
      res.json({ data: content });
    });
    
    fileStream.on('error', (error) => {
      console.error('Read error:', error);
      res.status(500).json({ error: 'Failed to retrieve metrics' });
    });
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Clear metrics
app.delete('/api/metrics', async (req, res) => {
  try {
    await fs.unlink(METRICS_FILE).catch(() => {});
    res.json({ success: true, message: 'Metrics cleared' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to clear metrics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.send('healthy');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
