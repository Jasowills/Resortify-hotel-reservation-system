import React from "react";
import RecentReservations from "../components/RecentReservations";
import ReservationForm from "../components/ReservationForm";

function UserManagement() {
  return (
    <div className="ml no-flex">
      <ReservationForm />
      <RecentReservations />
      <br/>
    </div>
  );
}

export default UserManagement;
