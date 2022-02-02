import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initContract } from "./utils";
import { BrowserRouter } from "react-router-dom";

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
      document.querySelector("#root")
    );
  })
  .catch(console.error);
