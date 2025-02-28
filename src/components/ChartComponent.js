import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Ensure auto-registration of components

const ChartComponent = ({ actualPrices, predictedPrices, labels }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // Track chart instance

  useEffect(() => {
    if (!chartRef.current) return;

    // ✅ Destroy existing chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    // ✅ Create a new chart instance
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Actual Prices",
            data: actualPrices,
            borderColor: "#00ff00", // Green for actual prices
            borderWidth: 2,
            fill: false,
          },
          {
            label: "Predicted Prices",
            data: predictedPrices,
            borderColor: "#ff4500", // Orange-red for predicted prices
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        scales: {
          x: {
            ticks: {
              color: "#FFFFFF", // White-colored x-axis labels
              font: {
                size: 12,
                weight: "bold",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)", // Light grid lines for x-axis
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#FFFFFF", // White-colored y-axis labels
              font: {
                size: 12,
                weight: "bold",
              },
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)", // Light grid lines for y-axis
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14,
               
                family: "Georgia, serif",
              },
              color: "#FFFFFF", // White-colored labels
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [actualPrices, predictedPrices, labels]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "700px",
        margin: "20px auto",
        padding: "10px",
        backgroundColor: "#222",
        border: '2px solid rgb(244, 240, 240)',
        boxShadow: '0px 0px 15px rgb(244, 240, 240)',
        borderRadius: "10px",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          color: "#FFFFFF", // White-colored text
          fontFamily: "Georgia, serif",
        }}
      >
        📊 Price Prediction Chart
      </h3>
      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;