import React from "react";
import { Routes, Route, Redirect, Navigate } from "react-router-dom";

const Router = ({ routes }) => {
  const authenticated = window.walletConnection.isSignedIn();

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<route.component />}
        />
      ))}
    </Routes>
  );
};

export default Router;
