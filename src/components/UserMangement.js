import React, { useState } from "react";
import axios from "axios";
import { formatAsDate } from "../utils/date-time"; // Replace with the correct import path

function UserManagement() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!fullName || !phoneNumber) {
      setError("Please provide both full name and phone number.");
      return;
    }

    try {
      setError(null); // Clear any previous error
      setSearching(true);
      const response = await axios.get(
        `http://localhost:5001/reservations/${fullName}/${phoneNumber}`
      );
      setSearchResults(response.data.data);
      setSearching(false);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError("An error occurred while fetching reservations.");
      setSearching(false);
    }
  };

  return (
    <div className="ml">
      <div className="user-management">
        <div className="todo">
          <div className="head">
            <h3>Check Reservations</h3>
          </div>
          <ul className="todo-list">
            <li className="completed">
              <label className="record-label">
                Full Name
                <input
                  className="record-input"
                  type="text"
                  name="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
            </li>{" "}
            <li className="completed">
              <label className="record-label">
                Phone Number
                <input
                  className="record-input"
                  type="number"
                  name="number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>
            </li>
            <button
              type="button"
              className="btn-booknow record-button"
              onClick={handleSearch}
            >
              Search
            </button>
          </ul>
          {error && <p className="error-message">{error}</p>}
        </div>{" "}
        <div className="todo right">
          <h3>Search Results</h3>
          <ul>
            {searching && (
              <p className="text-center">Searching reservations...</p>
            )}
            {searchResults.length === 0 && !searching && (
              <p className="text-center">No reservations found.</p>
            )}
            {searchResults.map((reservation) => (
              <li className="reservation-list" key={reservation.reservation_id}>
                <div>
                  <p>Full Name: </p> <span>{reservation.full_name}</span>{" "}
                </div>
                <div>
                  <p>Phone Number: </p> <span>{reservation.phone_number}</span>{" "}
                </div>
                <div>
                  <p>Room type: </p> <span>{reservation.type_of_room}</span>{" "}
                </div>
                <div>
                  <p>Check-In Date: </p>
                  <span>{formatAsDate(reservation.checkIn_date)}</span>
                </div>
                <div>
                  <p>Check-Out Date: </p>
                  <span>{formatAsDate(reservation.checkOut_date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
