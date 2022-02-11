import "regenerator-runtime/runtime";
import React from "react";
import "./global.css";

import Router from "./router/Router";
import { routes } from "./router/routing";
import MainWrapper from "./components/Layout/main/MainWrapper";

export default function App() {
  return (
    <MainWrapper>
      <Router routes={routes} />
    </MainWrapper>
  );
}
