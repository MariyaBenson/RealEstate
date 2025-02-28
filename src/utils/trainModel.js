import * as brain from "brain.js";
import propertyData from "../data/realEstateData.json";

// Define location embeddings
const locationMapping = {
  "Downtown": [1, 0, 0],
  "Suburban": [0, 1, 0],
  "Rural": [0, 0, 1],
};

// Ensure proper key access
const prices = propertyData.map((d) => d["Price (in $1000)"]);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

if (isNaN(minPrice) || isNaN(maxPrice)) {
  throw new Error("minPrice or maxPrice is NaN, check dataset.");
}

// Normalize dataset (with location embedding)
const normalizeData = (data) => {
  return data.map((item) => {
    const locationEmbedding = locationMapping[item["Location"]] || [0, 0, 0];

    return {
      input: {
        area: item["Area (sq ft)"] / 5000,
        bedrooms: item["Bedrooms"] / 5,
        bathrooms: item["Bathrooms"] / 3,
        age: item["Age of Property (years)"] / 50,
        loc0: locationEmbedding[0] * 10, // Increase weight of location features
        loc1: locationEmbedding[1] * 10,
        loc2: locationEmbedding[2] * 10,
      },
      output: { price: (item["Price (in $1000)"] - minPrice) / (maxPrice - minPrice) },
    };
  });
};

export const trainModel = () => {
  if (!brain || !brain.NeuralNetwork) {
    throw new Error("Brain.js failed to load. Check installation.");
  }

  let net;

  // Delete existing model in LocalStorage before training
  // localStorage.removeItem("trainedModel");

  net = new brain.NeuralNetwork({
    hiddenLayers: [40, 30, 20, 10], // More neurons to ensure location features contribute
  });

  const trainingData = normalizeData(propertyData);

  console.log("Training Data Sample:", trainingData.slice(0, 5)); // Debugging
  console.log("Training Model...");

  net.train(trainingData, {
    iterations: 100000, // More iterations for better learning
    learningRate: 0.002, // Reduced learning rate for finer learning
    errorThresh: 0.000005, // Smaller threshold for better accuracy
  });

  // Save trained model to LocalStorage
  localStorage.setItem("trainedModel", JSON.stringify(net.toJSON()));
  console.log("Model Trained and Stored in LocalStorage.");

  return { net, minPrice, maxPrice };
};
