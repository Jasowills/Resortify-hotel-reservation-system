import React from "react";
import { Route, Switch } from "react-router-dom";
import ReservationRecords from "../components/ReservationRecords";
import UserManagement from "../components/UserMangement";
import NotFound from "./NotFound";

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin/reservation-records">
        <ReservationRecords />
      </Route>
      <Route path="/admin/user-management">
        <UserManagement />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default AdminRoutes;
