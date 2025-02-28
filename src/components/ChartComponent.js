import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

const ChartComponent = ({ actualPrices, predictedPrices, labels }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Actual Price (in $1000)",
          data: actualPrices,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
        {
          label: "Predicted Price (in $1000)",
          data: predictedPrices,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    });
  }, [actualPrices, predictedPrices, labels]); // ✅ Chart updates when data changes

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="mt-4">
      <h3 className="text-center">Actual vs Predicted Prices</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ChartComponent;
