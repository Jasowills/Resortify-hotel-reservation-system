// Routes.js
import React from "react";
import { Route, Switch } from "react-router-dom";
import UserManagement from "../components/UserMangement";
import Reservation from "../pages/Reservation";
import Rooms from "../pages/Rooms";
import AdminLayout from "./AdminLayout";
import NotFound from "./NotFound";

function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Reservation />
      </Route>
      <Route path="/rooms">
        <Rooms />
      </Route>
      <Route path="/admin">
        <AdminLayout />
      </Route>
      <Route path="/user-management">
        <UserManagement />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
