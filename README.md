# Copilot Metrics Portal

A futuristic, dynamic web portal for visualizing GitHub Copilot adoption metrics and AI-assisted development analytics. Built with a modern dark theme featuring glassmorphism effects and comprehensive data visualizations.

## ✨ Features

### 📊 **Summary Dashboard**
Comprehensive metrics overview with interactive visualizations:

**Metric Cards:**
- Total users and active users (with Agent/Chat breakdowns)
- Total interactions and acceptance metrics
- Code generations and suggestions
- Lines of code affected (additions + deletions)

**Time-Series Analytics:**
- **Daily Active Users** - Track daily user engagement trends with filled area chart
- **Weekly Active Users** - Visualize weekly adoption patterns
- **Average Chat Requests** - Monitor average chat interactions per user per day

**Distribution Visualizations:**
- **Programming Languages** (Pie Chart) - Top 10 languages by code generation volume with color-coded segments
- **Feature Usage** (Pie Chart) - Interactive breakdown of Copilot features usage
- **IDE Distribution** (Bar Chart) - Dual Y-axis chart showing users and interactions per IDE
- **AI Model Usage** (Bar Chart) - Compare interactions, generations, and acceptances across AI models

**Acceptance Rate Analytics:**
- **Model Acceptance Rate** - Color-coded vertical bar chart showing acceptance rates per AI model (Green: 80%+, Blue: 60-80%, Orange: 40-60%, Red: <40%)
- **Language Acceptance Rate** - Scrollable horizontal bar chart displaying acceptance rates for all programming languages, sorted by rate (highest first)

### 👥 **User Table**
Detailed user adoption metrics with advanced functionality:
- **Search** - Find users by username
- **Sort** - Click any column header to sort (username, IDE, LOC, interactions, acceptances, rate)
- **Filter** - Filter by IDE and feature usage
- **Color-coded metrics** - Blue usernames, green additions, red deletions
- **Scrollable** - Sticky header with smooth scrolling for large datasets
- **Acceptance rate** - Individual user acceptance percentages

### 💾 **Data Persistence**
- Client-side caching using browser localStorage
- Data persists across browser sessions
- Override by uploading new file
- Clear all data with one click

### 🎨 **Modern Design**
- **Futuristic dark theme** - Deep slate gradients with glassmorphism effects
- **Glass panels** - Translucent components with backdrop blur
- **Gradient text** - Blue-purple-pink gradient headers
- **Glow effects** - Subtle hover glows and shadows
- **Custom scrollbars** - Dark-themed, styled scrollbars
- **Responsive layout** - Adapts to all screen sizes
- **Smooth animations** - Polished interactions and transitions

### 📁 **Easy Data Upload**
- Drag-and-drop interface with visual feedback
- Click to browse file system
- NDJSON format validation
- Instant data processing and visualization

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## How to Use

1. **Export Copilot Metrics**:
   - Go to GitHub Enterprise settings
   - Navigate to Copilot > Usage metrics
   - Export data in NDJSON format

2. **Upload Data**:
   - Drag and drop your NDJSON file onto the upload area
   - Or click to browse and select your file

3. **Explore Metrics**:
   - View summary dashboard with comprehensive visualizations
   - Monitor time-series trends (daily/weekly users, chat requests)
   - Compare acceptance rates across models and programming languages
   - Analyze IDE and feature usage distributions
   - Dive into user-level details with the sortable table

4. **Update Data**:
   - Click "Upload New File" to override cached data
   - Click "Clear Data" to remove all cached metrics

## Data Format

The portal expects GitHub Copilot usage metrics in NDJSON format. Each line should be a JSON object containing user metrics. See [GitHub's Copilot Usage Metrics documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/reference/copilot-usage-metrics) for field definitions.

**Key fields used:**
- `user_id` - Unique user identifier
- `day` - Date of metrics
- `ide_category`, `ide_name` - IDE information
- `language` - Programming language
- `copilot_model` - AI model used
- `user_initiated_interaction_count` - User interactions
- `code_generation_count` - Code suggestions generated
- `code_acceptances_count` - Accepted suggestions
- `code_lines_suggested`, `code_lines_accepted` - LOC metrics
- Feature breakdowns: `agent_*`, `chat_*`, `code_*`, `docs_*`, etc.

## Screenshots

### Dashboard Overview
![Dashboard with glassmorphic cards and gradient text](docs/images/dashboard.png)

### Time-Series Analytics
![Daily/Weekly active users and chat request trends](docs/images/timeseries.png)

### Distribution Charts
![Programming languages, IDE, model, and feature usage](docs/images/distributions.png)

### Acceptance Rate Analytics
![Model and language acceptance rate comparisons](docs/images/acceptance-rates.png)

### User Table
![Sortable and filterable user adoption table](docs/images/user-table.png)

*Note: Add screenshots to `docs/images/` directory for visual documentation*

## Key Metrics Explained

- **Total Users** - Unique users in the dataset
- **Active Users** - Users with any interaction
- **Users with Agent** - Users who used Copilot Agent features
- **Users with Chat** - Users who used Copilot Chat features
- **Total Interactions** - Sum of all user-initiated interactions
- **Total Acceptances** - Number of accepted code suggestions
- **Acceptance Rate** - (Acceptances / Generations) × 100
- **Lines of Code Affected** - Total lines added + deleted via Copilot
- **Daily Active Users (DAU)** - Unique users active per day
- **Weekly Active Users (WAU)** - Unique users active per week
- **Average Chat Requests** - Mean chat interactions per user per day

## Privacy & Security

- **No data transmission** - All processing happens in your browser
- **No backend required** - Static site, can be hosted anywhere
- **localStorage only** - Data stays on your machine
- **No analytics** - Zero tracking or telemetry
- **Open source** - Full transparency, inspect the code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Tech Stack

- **React 18** - Modern UI framework with hooks
- **Vite 5** - Lightning-fast build tool and dev server with HMR
- **Tailwind CSS 3** - Utility-first CSS with custom dark theme
- **Chart.js 4** - Powerful data visualization library
- **react-chartjs-2** - React wrapper for Chart.js
- **localStorage API** - Client-side data persistence (no backend required)

## Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx                    # Drag-and-drop file upload with glassmorphic design
│   ├── SummaryDashboard.jsx              # Main metrics dashboard and chart grid
│   ├── UserTable.jsx                     # Sortable/filterable user adoption table
│   ├── LanguagePieChart.jsx              # Top 10 programming languages pie chart
│   ├── FeatureBarChart.jsx               # Feature usage pie chart
│   ├── IdeBarChart.jsx                   # IDE distribution with dual Y-axes
│   ├── ModelBarChart.jsx                 # AI model usage comparison bars
│   ├── DailyActiveUsersChart.jsx         # Daily active users line chart
│   ├── WeeklyActiveUsersChart.jsx        # Weekly active users line chart
│   ├── AverageChatRequestsChart.jsx      # Average chat requests trend
│   ├── ModelAcceptanceRateChart.jsx      # Model acceptance rate vertical bars
│   └── LanguageAcceptanceRateChart.jsx   # Language acceptance rate horizontal bars
├── utils/
│   └── dataProcessor.js                  # NDJSON parsing, metrics calculation, caching
├── App.jsx                               # Main application with state management
├── main.jsx                              # React entry point
└── index.css                             # Global styles, dark theme, glassmorphism
```

## License

MIT
