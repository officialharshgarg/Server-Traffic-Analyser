const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const LOG_URL = "https://support.netgables.org/apache_combined.log";
const LOG_FILE = path.join("", "server_log.txt");

// Regex pattern to extract IP, date, and hour
const logPattern = /(\d+\.\d+\.\d+\.\d+) .* \[(\d{2})\/(\w+)\/(\d{4}):(\d{2}):/;

// Function to fetch and save the log file
async function fetchAndSaveLog() {
  try {
    console.log("📥 Downloading log file...");
    const response = await axios.get(LOG_URL);
    fs.writeFileSync(LOG_FILE, response.data);
    console.log("✅ Log file saved successfully!");
  } catch (error) {
    console.error("❌ Error fetching log file:", error.message);
  }
}

// Function to parse logs
function parseLogFile(filePath) {
  const ipCount = {};
  const hourlyTraffic = {};

  const logData = fs.readFileSync(filePath, "utf8");
  const lines = logData.split("\n");

  lines.forEach((line) => {
    const match = line.match(logPattern);
    if (match) {
      const ip = match[1];
      const hour = match[5];

      ipCount[ip] = (ipCount[ip] || 0) + 1;
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    }
  });

  return { ipCount, hourlyTraffic };
}

// Function to get top contributors
function topContributors(data, percentage) {
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0);

  let cumulative = 0;
  const result = [];
  for (const [key, count] of sortedEntries) {
    cumulative += count;
    result.push({ key, count });
    if (cumulative / total >= percentage) break;
  }
  return result;
}

// Route to fetch log data
app.get("/log-data", async (req, res) => {
  await fetchAndSaveLog(); // Ensure logs are up-to-date

  const { ipCount, hourlyTraffic } = parseLogFile(LOG_FILE);
  const topIps = topContributors(ipCount, 0.85);
  const topHours = topContributors(hourlyTraffic, 0.7);

  res.json({
    ip_histogram: ipCount,
    hourly_traffic: hourlyTraffic,
    top_ips: topIps,
    top_hours: topHours,
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
