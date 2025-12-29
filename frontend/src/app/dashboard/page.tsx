"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardHome() {
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/regions")
      .then(res => res.json())
      .then(setRegions);
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Select Region</h1>

      <ul className="mt-4 space-y-2">
        {regions.map(region => (
          <li key={region}>
            <Link
              href={`/dashboard/${region}`}
              className="text-cyan-400 hover:underline"
            >
              {region}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
