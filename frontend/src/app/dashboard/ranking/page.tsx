"use client";
import { useEffect, useState } from "react";

export default function Ranking() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/ranking")
      .then(res => res.json())
      .then(setRows);
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-xl font-bold">Region Risk Ranking</h1>

      <table className="mt-4 border border-white/20">
        <thead>
          <tr>
            <th className="px-4 py-2">Region</th>
            <th className="px-4 py-2">Risk</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.region}>
              <td className="px-4 py-2">{r.region}</td>
              <td className="px-4 py-2">{r.risk_score.toFixed(2)}</td>
              <td className="px-4 py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
