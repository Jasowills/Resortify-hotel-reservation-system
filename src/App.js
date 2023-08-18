import React from "react";
import { Route, Switch } from "react-router-dom";
import Layout from "./layout/Layout";
import AdminLayout from "./layout/AdminLayout";
import "./styles/Mediaqueries.css"
function App() {
  return (
    <Switch>
      <Route path="/admin">
        <AdminLayout />
      </Route>
      <Route path="/">
        <Layout />
      </Route>
    </Switch>
  );
}

export default App;
