import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatAsDate } from "../utils/date-time";
import {
  BiBeenHere,
  BiCalendar,
  BiCalendarEvent,
  BiUser,
} from "react-icons/bi";
function ReservationRecords() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const response = await axios.get("http://localhost:5001/reservations");
        setReservations(response.data.data.reverse());
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    }

    fetchReservations();
  }, []);

  return (
    <div className="ml">
      <div className="table-data shift">
        <div className="order">
          <div className="head">
            <h3>Recent Reservations</h3>
            <i className="bx bx-search"></i>
            <i className="bx bx-filter"></i>
          </div>
          <table>
            <thead>
              <tr>
                <th>
                  <span className="show">User</span>{" "}
                  <span className="hide">
                    <BiUser />
                  </span>
                </th>
                <th>
                  <span className="show">Check-In Date</span>{" "}
                  <span className="hide">
                    <BiCalendar />
                  </span>
                </th>
                <th>
                  <span className="show">Check-Out Date</span>{" "}
                  <span className="hide">
                    <BiCalendarEvent />
                  </span>
                </th>{" "}
                <th className="show">
                  <span className="show">Status</span>{" "}
                  <span className="hide">
                    <BiBeenHere />
                  </span>
                </th>{" "}
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr className="tr" key={reservation.reservation_id}>
                  <td>
                    <p>{reservation.full_name}</p>
                  </td>
                  <td>{formatAsDate(reservation.checkIn_date)}</td>
                  <td>{formatAsDate(reservation.checkOut_date)}</td>
                  <td className="show">
                    <span className={`status completed`}>Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReservationRecords;
