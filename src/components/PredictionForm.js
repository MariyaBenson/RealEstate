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
  const [userActualPrice, setUserActualPrice] = useState(""); // Store user input
  const [showActualPriceInput, setShowActualPriceInput] = useState(false); // Toggle input visibility
  const [feedback, setFeedback] = useState({ rating: "", comments: "" });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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

    if (
      isNaN(area) || isNaN(bedrooms) || isNaN(bathrooms) || isNaN(age) ||
      area <= 0 || bedrooms <= 0 || bathrooms <= 0 || age < 0
    ) {
      setShowActualPriceInput(true);
      return;
    }

    const locationEmbedding = locationMapping[location] || [0, 0, 0];

    const input = {
      area: area / 5000,
      bedrooms: bedrooms / 5,
      bathrooms: bathrooms / 3,
      age: age / 50,
      loc0: locationEmbedding[0],
      loc1: locationEmbedding[1],
      loc2: locationEmbedding[2],
    };

    const output = model.run(input);
    if (!output || typeof output.price === "undefined" || isNaN(output.price)) {
      setShowActualPriceInput(true);
      return;
    }

    const predictedPrice = (output.price * (maxPrice - minPrice)) + minPrice;
    setPredictedPrice(predictedPrice.toFixed(2));

    let actualData = propertyData.find(
      (item) =>
        Math.abs(item["Area (sq ft)"] - area) < 10 &&
        item["Bedrooms"] === bedrooms &&
        item["Bathrooms"] === bathrooms &&
        item["Age of Property (years)"] === age &&
        item["Location"].toLowerCase() === location.toLowerCase()
    );

    let actualPrice = actualData ? actualData["Price (in $1000)"] : null;

    if (actualPrice === null) {
      setShowActualPriceInput(true);
    } else {
      setActualPrices((prev) => [...prev, actualPrice]);
      setPredictedPrices((prev) => [...prev, predictedPrice]);
      setLabels((prev) => [...prev, `Prediction ${prev.length + 1}`]);
    }

    setShowFeedbackForm(true);
  };

  const handleActualPriceSubmit = () => {
    const actualPrice = parseFloat(userActualPrice);

    if (isNaN(actualPrice) || actualPrice <= 0) {
      return;
    }

    propertyData.push({
      "Area (sq ft)": parseFloat(formData.area),
      "Bedrooms": parseFloat(formData.bedrooms),
      "Bathrooms": parseFloat(formData.bathrooms),
      "Age of Property (years)": parseFloat(formData.age),
      "Location": formData.location,
      "Price (in $1000)": actualPrice,
    });

    setActualPrices((prev) => [...prev, actualPrice]);
    setPredictedPrices((prev) => [...prev, predictedPrice]);
    setLabels((prev) => [...prev, `Prediction ${prev.length + 1}`]);

    setShowActualPriceInput(false);
    setUserActualPrice("");
  };

  const handleFeedbackChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleFeedbackSubmit = () => {
    console.log("User Feedback:", feedback);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="container mt-4" style={{ fontFamily: 'Georgia, serif'}}>
      <div className="card p-4 shadow" style={{ backgroundColor:'grey',color:'white'}}>
        <div className="mb-3">
          <label className="form-label">🏠 Area (sq ft)</label>
          <input type="number" name="area" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">🛏️ Bedrooms</label>
          <input type="number" name="bedrooms" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">🛁 Bathrooms</label>
          <input type="number" name="bathrooms" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">🏗️ Age of Property</label>
          <input type="number" name="age" className="form-control" onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">📍 Location</label>
          <select name="location" className="form-control" onChange={handleChange}>
            <option value="Downtown">Downtown</option>
            <option value="Suburban">Suburban</option>
            <option value="Rural">Rural</option>
          </select>
        </div>
        <button className="btn btn-primary w-100"  onClick={handlePredict}>📊 Predict Price</button>
        {predictedPrice !== null && <h2 className="mt-3">💰 Predicted Price: ${predictedPrice}k</h2>}
      </div>

      {showActualPriceInput && (
        <div className="mt-4">
          <h5>❓ Enter Actual Price (in $1000)</h5>
          <input type="number" className="form-control" value={userActualPrice} onChange={(e) => setUserActualPrice(e.target.value)} />
          <button className="btn btn-success mt-2" onClick={handleActualPriceSubmit}>✅ Submit</button>
        </div>
      )}
      <ChartComponent actualPrices={actualPrices} predictedPrices={predictedPrices} labels={labels} />


      {showFeedbackForm && !feedbackSubmitted && (
        <div className="mt-4 card p-4 shadow">
          <h5>📝 User Feedback</h5>
          <label className="form-label">Rating (1-5):</label>
          <input type="number" name="rating" className="form-control" min="1" max="5" onChange={handleFeedbackChange} />
          <label className="form-label mt-2">Comments:</label>
          <textarea name="comments" className="form-control" onChange={handleFeedbackChange}></textarea>
          <button className="btn btn-success mt-2" onClick={handleFeedbackSubmit}>✅ Submit Feedback</button>
        </div>
      )}

    </div>
  );
};

export default PredictionForm;
