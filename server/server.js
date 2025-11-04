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

// Get user statistics
app.get('/api/getuser', async (req, res) => {
  try {
    const username = req.headers['github-username'];
    
    if (!username) {
      return res.status(400).json({ error: 'GitHub username header is required' });
    }

    const exists = await fs.access(METRICS_FILE).then(() => true).catch(() => false);
    
    if (!exists) {
      return res.status(404).json({ error: 'No metrics data available' });
    }

    // Read the metrics file
    const content = await fs.readFile(METRICS_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    const userData = lines.map(line => JSON.parse(line));

    // Filter records for the specific user
    const userRecords = userData.filter(record => record.user_login === username);

    if (userRecords.length === 0) {
      return res.status(404).json({ error: `No data found for user: ${username}` });
    }

    // Aggregate user statistics
    const stats = {
      userId: userRecords[0].user_id,
      userLogin: username,
      dates: [],
      daysWithAgent: new Set(),
      languages: new Set(),
      interactions: 0,
      codeGeneration: 0,
      codeAcceptance: 0,
      locSuggested: 0,
      locAdded: 0,
      locDeleted: 0,
      usedAgent: false,
      usedChat: false,
      ides: new Set(),
      ideVersions: new Set(),
      pluginVersions: new Set()
    };

    userRecords.forEach(record => {
      stats.dates.push(record.day);
      stats.interactions += record.user_initiated_interaction_count || 0;
      stats.codeGeneration += record.code_generation_activity_count || 0;
      stats.codeAcceptance += record.code_acceptance_activity_count || 0;
      stats.locSuggested += record.loc_suggested_to_add_sum || 0;
      stats.locAdded += record.loc_added_sum || 0;
      stats.locDeleted += record.loc_deleted_sum || 0;
      
      if (record.used_agent) {
        stats.usedAgent = true;
        stats.daysWithAgent.add(record.day);
      }
      if (record.used_chat) stats.usedChat = true;
      
      // Collect languages from language features
      if (record.totals_by_language_feature) {
        record.totals_by_language_feature.forEach(lang => {
          if (lang.language && lang.language !== 'unknown') {
            stats.languages.add(lang.language);
          }
        });
      }
      
      if (record.totals_by_ide) {
        record.totals_by_ide.forEach(ide => {
          if (ide.ide) stats.ides.add(ide.ide);
          if (ide.ide_version) stats.ideVersions.add(ide.ide_version);
          if (ide.last_known_plugin_version?.plugin_version) {
            stats.pluginVersions.add(ide.last_known_plugin_version.plugin_version);
          }
        });
      }
    });

    // Calculate derived fields
    const acceptanceRate = stats.codeGeneration > 0
      ? ((stats.codeAcceptance / stats.codeGeneration) * 100).toFixed(1)
      : 0;

    const sortedDates = stats.dates.sort();
    const dateRange = sortedDates.length > 1 
      ? `${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`
      : sortedDates[0] || 'N/A';
    
    const agentAVGUsage = stats.dates.length > 0
      ? ((stats.daysWithAgent.size / stats.dates.length) * 100).toFixed(1)
      : 0;

    const response = {
      userId: stats.userId,
      userLogin: stats.userLogin,
      dateRange: dateRange,
      daysActive: stats.dates.length,
      ide: Array.from(stats.ides).join(', ') || 'N/A',
      ideVersion: Array.from(stats.ideVersions).join(', ') || 'N/A',
      pluginVersion: Array.from(stats.pluginVersions).join(', ') || 'N/A',
      interactions: stats.interactions,
      codeGeneration: stats.codeGeneration,
      codeAcceptance: stats.codeAcceptance,
      acceptanceRate: parseFloat(acceptanceRate),
      locSuggested: stats.locSuggested,
      locAdded: stats.locAdded,
      locDeleted: stats.locDeleted,
      usedAgent: stats.usedAgent,
      usedChat: stats.usedChat,
      agentAVGUsage: parseFloat(agentAVGUsage),
      agentDaysUsed: stats.daysWithAgent.size,
      languagesUsedCount: stats.languages.size,
      languagesUsed: Array.from(stats.languages).sort().join(', ')
    };

    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user statistics' });
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
