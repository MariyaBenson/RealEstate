import * as brain from "brain.js";
import propertyData from "../data/realEstateData.json";

// Define location embeddings
const locationMapping = {
  "Downtown": [1, 0, 0],
  "Suburban": [0, 1, 0],
  "Rural": [0, 0, 1],
};

// Get price range for normalization
const prices = propertyData.map((d) => d["Price (in $1000)"]);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

if (isNaN(minPrice) || isNaN(maxPrice)) {
  throw new Error("minPrice or maxPrice is NaN, check dataset.");
}

// ✅ Normalize dataset (fix location scaling)
const normalizeData = (data) => {
  return data.map((item) => {
    const locationEmbedding = locationMapping[item["Location"]] || [0, 0, 0];

    return {
      input: {
        area: item["Area (sq ft)"] / 5000,
        bedrooms: item["Bedrooms"] / 5,
        bathrooms: item["Bathrooms"] / 3,
        age: item["Age of Property (years)"] / 50,
        loc0: locationEmbedding[0], // No more * 10
        loc1: locationEmbedding[1],
        loc2: locationEmbedding[2],
      },
      output: { price: (item["Price (in $1000)"] - minPrice) / (maxPrice - minPrice) },
    };
  });
};

// ✅ Train Model with Optimized Parameters
export const trainModel = () => {
  if (!brain || !brain.NeuralNetwork) {
    throw new Error("Brain.js failed to load. Check installation.");
  }

  let net;

  // ✅ Check if a trained model exists in LocalStorage
  const storedModel = localStorage.getItem("trainedModel");
  if (storedModel) {
    net = new brain.NeuralNetwork();
    net.fromJSON(JSON.parse(storedModel));
    console.log("Loaded model from LocalStorage.");
  } else {
    net = new brain.NeuralNetwork({
      hiddenLayers: [20, 15, 10], // Reduce layers for efficiency
    });

    const trainingData = normalizeData(propertyData);

    console.log("Training Model...");

    net.train(trainingData, {
      iterations: 10000, // Reduce iterations for faster training
      learningRate: 0.01, // Slightly increase learning rate
      errorThresh: 0.0001,
    });

    // ✅ Save trained model to LocalStorage
    localStorage.setItem("trainedModel", JSON.stringify(net.toJSON()));
    console.log("Model Trained and Stored in LocalStorage.");
  }

  return { net, minPrice, maxPrice };
};
