import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
