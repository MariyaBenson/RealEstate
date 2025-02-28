import React, { useState, useEffect } from "react";
import { trainModel } from "../utils/trainModel";
import ChartComponent from "./ChartComponent";
import "bootstrap/dist/css/bootstrap.min.css";
import propertyData from "../data/realEstateData.json"; // Import dataset

const locationMapping = {
  "Downtown": [1, 0, 0],
  "Suburban": [0, 1, 0],
  "Rural": [0, 0, 1],
};

const PredictionForm = () => {
  const [model, setModel] = useState(null);
  const [formData, setFormData] = useState({
    area: "",
    bedrooms: "",
    bathrooms: "",
    age: "",
    location: "Downtown",
  });
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1);
  const [actualPrices, setActualPrices] = useState([]);
  const [predictedPrices, setPredictedPrices] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const trainedModel = trainModel();
    setModel(trainedModel.net);
    setMinPrice(trainedModel.minPrice);
    setMaxPrice(trainedModel.maxPrice);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = () => {
    if (!model) {
      setPredictedPrice("Model not loaded");
      return;
    }
  
    const area = parseFloat(formData.area);
    const bedrooms = parseFloat(formData.bedrooms);
    const bathrooms = parseFloat(formData.bathrooms);
    const age = parseFloat(formData.age);
    const location = formData.location;
  
    if (isNaN(area) || isNaN(bedrooms) || isNaN(bathrooms) || isNaN(age)) {
      setPredictedPrice("Invalid input values");
      return;
    }
  
    // ✅ Apply location embedding
    const locationEmbedding = locationMapping[location] || [0, 0, 0];
  
    const input = {
      area: area / 5000,
      bedrooms: bedrooms / 5,
      bathrooms: bathrooms / 3,
      age: age / 50,
      loc0: locationEmbedding[0] * 10, // Boosting location embedding importance
      loc1: locationEmbedding[1] * 10,
      loc2: locationEmbedding[2] * 10,
    };
  
    console.log("Input to Model:", input);
  
    const output = model.run(input);
    console.log("Raw Model Output:", output);
  
    if (!output || typeof output.price === "undefined" || isNaN(output.price)) {
      setPredictedPrice("Invalid Prediction");
      return;
    }
  
    // ✅ Fix normalization when converting back to real prices
    const predictedPrice = (output.price * (maxPrice - minPrice)) + minPrice;
    console.log("Final Predicted Price:", predictedPrice);
  
    setPredictedPrice(predictedPrice.toFixed(2));
  
    // ✅ Fetch the actual price from the dataset
    const actualData = propertyData.find(
      (item) =>
        Math.abs(item["Area (sq ft)"] - area) < 10 &&
        item["Bedrooms"] === bedrooms &&
        item["Bathrooms"] === bathrooms &&
        item["Age of Property (years)"] === age &&
        item["Location"].toLowerCase() === location.toLowerCase()
    );
  
    const actualPrice = actualData ? actualData["Price (in $1000)"] : "N/A";
  
    console.log("Actual Price from Dataset:", actualPrice);
  
    // ✅ Ensure Chart Updates Correctly
    setActualPrices((prev) => [...prev, actualPrice !== "N/A" ? actualPrice : 0]);
    setPredictedPrices((prev) => [...prev, predictedPrice]);
    setLabels((prev) => [...prev, `Prediction ${prev.length + 1}`]);
  };
  
  
  

  return (
    <div className="container mt-5">
      <h2 className="text-center">Real Estate Price Prediction</h2>
      <div className="card p-4 shadow">
        <div className="mb-3">
          <label className="form-label">Area (sq ft)</label>
          <input type="number" name="area" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Bedrooms</label>
          <input type="number" name="bedrooms" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Bathrooms</label>
          <input type="number" name="bathrooms" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Age of Property</label>
          <input type="number" name="age" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Location</label>
          <select name="location" className="form-control" onChange={handleChange}>
            <option value="Downtown">Downtown</option>
            <option value="Suburban">Suburban</option>
            <option value="Rural">Rural</option>
          </select>
        </div>
        <button className="btn btn-primary w-100" onClick={handlePredict}>Predict Price</button>
        {predictedPrice !== null && <h2 className="mt-3">Predicted Price: ${predictedPrice}k</h2>}
      </div>
      {/* Chart Component */}
      <ChartComponent actualPrices={actualPrices} predictedPrices={predictedPrices} labels={labels} />
    </div>
  );
};

export default PredictionForm;
