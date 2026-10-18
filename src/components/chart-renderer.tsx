"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
  Title,
  Tooltip,
  Legend,
);

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ChartRenderer({
  config,
}: {
  config: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !config) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(
      canvasRef.current,
      config as ChartConfiguration,
    );

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [config]);

  if (!config) return null;

  return (
    <div className="h-72">
      <canvas ref={canvasRef} />
    </div>
  );
}
