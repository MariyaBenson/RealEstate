import React from "react";
import PredictionForm from "./components/PredictionForm";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">Real Estate Price Prediction</h1>
      <PredictionForm />
    </div>
  );
};

export default App;
