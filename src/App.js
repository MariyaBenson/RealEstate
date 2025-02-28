import React from "react";
import PredictionForm from "./components/PredictionForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  return (
    
    <div className="container-fluid" style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h1 className="text-center" style={{ fontFamily: 'Georgia, serif'}}>Real Estate Price Prediction</h1>
      <div className="container mt-5 p-4" style={{ border: '2px solid rgb(244, 240, 240)', boxShadow: '0px 0px 15px rgb(244, 240, 240)',borderRadius:'10px' }}>
      <PredictionForm />
    </div>
  </div>
   
      
  );
};

export default App;
