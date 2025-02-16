import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [logData, setLogData] = useState(null);

  useEffect(() => {
    axios
      .get("https://server-traffic-analyser.onrender.com")
      .then((response) => setLogData(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (!logData) return <p>Loading...</p>;

  // Format data for charts
  const ipHistogram = Object.entries(logData.ip_histogram).map(
    ([ip, count]) => ({ ip, count })
  );
  const hourlyTraffic = Object.entries(logData.hourly_traffic).map(
    ([hour, count]) => ({ hour, count })
  );

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Server Log Dashboard</h1>

      {/* IP Histogram */}
      <h2 className="text-xl font-semibold">IP Address Frequency</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ipHistogram}>
          <XAxis dataKey="ip" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Hourly Traffic */}
      <h2 className="text-xl font-semibold mt-6">Hourly Traffic</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={hourlyTraffic}>
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* Top 85% IPs */}
      <h2 className="text-xl font-semibold mt-6">Top 85% Contributing IPs</h2>
      <table className="border-collapse w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">IP Address</th>
            <th className="border border-gray-300 px-4 py-2">Requests</th>
          </tr>
        </thead>
        <tbody>
          {logData.top_ips.map(({ key, count }, index) => (
            <tr key={index} className="text-center border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{key}</td>
              <td className="border border-gray-300 px-4 py-2">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Top 70% Traffic Hours */}
      <h2 className="text-xl font-semibold mt-6">Top 70% Traffic Hours</h2>
      <table className="border-collapse w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Hour</th>
            <th className="border border-gray-300 px-4 py-2">Requests</th>
          </tr>
        </thead>
        <tbody>
          {logData.top_hours.map(({ key, count }, index) => (
            <tr key={index} className="text-center border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{key}:00</td>
              <td className="border border-gray-300 px-4 py-2">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
