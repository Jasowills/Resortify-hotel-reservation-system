import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { formatAsDate } from "../utils/date-time";
const RecentReservations = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState({ data: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedReservation, setEditedReservation] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    checkIn_date: "",
    checkOut_date: "",
    type_of_room: "",
    number_of_guest: 1,
    number_of_rooms: 1,
  });

  useEffect(() => {
    const reservationData = localStorage.getItem("reservationData");
    console.log(reservationData);
    if (reservationData) {
      try {
        const parsedData = JSON.parse(reservationData);
        if (parsedData && Array.isArray(parsedData.data)) {
          setReservations(parsedData);
        }
      } catch (error) {
        console.error("Error parsing reservation data:", error);
      }
    }
  }, []);

  const handleDeleteReservation = async (id) => {
    console.log("Deleting reservation with ID:", id);

    try {
      await axios.delete(`http://localhost:5001/reservations/${id}`);

      const updatedReservations = reservations.data.filter(
        (reservation) => reservation.data.reservation_id !== id
      );

      setReservations({ data: updatedReservations }); // Assuming setReservations expects an object with "data" key

      localStorage.setItem(
        "reservationData",
        JSON.stringify({ data: updatedReservations })
      );
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditReservation = (reservation) => {
    setEditedReservation({
      ...reservation,
      reservation_id: reservation.reservation_id,
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      const updatedData = {
        reservation_id: editedReservation.data.reservation_id,
        full_name: editedReservation.full_name,
        email: editedReservation.email,
        phone_number: editedReservation.phone_number,
        checkIn_date: editedReservation.checkIn_date,
        checkOut_date: editedReservation.checkOut_date,
        type_of_room: editedReservation.type_of_room,
        number_of_guest: editedReservation.number_of_guest,
        number_of_rooms: editedReservation.number_of_rooms,
      };

      const response = await axios.put(
        `http://localhost:5001/reservations/${editedReservation.data.reservation_id}`,
        updatedData
      );

      if (response.status === 200) {
        enqueueSnackbar("Reservation updated successfully", {
          variant: "success",
          style: { marginLeft: "350px" },
          position: "top-right",
          className: "snackbar",
        });

        const updatedReservations = reservations.data.map((reservation) =>
          reservation.reservation_id === editedReservation.reservation_id
            ? { ...reservation, ...{ data: updatedData } }
            : reservation
        );

        setReservations({ data: updatedReservations });
        localStorage.setItem(
          "reservationData",
          JSON.stringify({ data: updatedReservations })
        );
      } else {
        enqueueSnackbar("Failed to update reservation", {
          variant: "error",
          style: { marginLeft: "350px" },
          position: "top-right",
          className: "snackbar",
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error editing reservation:", error);
    }
  };

  return (
    <div className="recent-reservations-container">
      <h2>Recent Reservations</h2>
      {reservations.data.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <ul className="">
          {reservations.data.map((reservation) => (
            <li key={reservation.reservation_id}>
              <div className="reservation-item">
                <p>Name: {reservation.data.full_name}</p>
                <p>Email: {reservation.data.email}</p>
                <p>Phone Number: {reservation.data.phone_number}</p>
                <p>
                  CheckIn-Date: {formatAsDate(reservation.data.checkIn_date)}
                </p>
                <p>
                  CheckOut-Date: {formatAsDate(reservation.data.checkOut_date)}
                </p>
                <p>Room Type: {reservation.data.type_of_room}</p>
                <p>Number Of guest: {reservation.data.number_of_guest}</p>
                <p>Number Of rooms: {reservation.data.number_of_rooms}</p>
              </div>
              <div className="reservation-actions">
                <button
                  className="edit-reservation"
                  onClick={() => handleEditReservation(reservation)}
                >
                  Edit Reservation
                </button>
                <button
                  className="delete-button"
                  onClick={() =>
                    handleDeleteReservation(reservation.data.reservation_id)
                  }
                >
                  Delete Reservation
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content2">
            <h2>Edit Reservation</h2>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      full_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={(e) =>
                  setEditedReservation({
                    ...editedReservation,
                    email: e.target.value,
                  })
                }
                required
              />
              <div className="">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      phone_number: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="">
                <label htmlFor="type_of_room">Room Type</label>
                <select
                  id="roomType"
                  className="modal-select"
                  name="type_of_room"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      type_of_room: e.target.value,
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Room Type
                  </option>
                  <option value="Suite">Suite</option>
                  <option value="Standard Suite">Standard Suite</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                  <option value="Family room">Family room</option>
                  <option value="Studio">Studio</option>
                  <option value="Executive suite">Executive Suite</option>
                </select>
              </div>
              <div className="">
                <label htmlFor="checkIn_date">Check-In Date</label>
                <input
                  type="date"
                  id="checkIn_date"
                  name="checkIn_date"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      checkIn_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="checkOut_date">Check-Out Date</label>
                <input
                  type="date"
                  id="checkOut_date"
                  name="checkOut_date"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      checkOut_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="number_of_guest">Number of Guest</label>
                <input
                  type="number"
                  id="number_of_guest"
                  name="number_of_guest"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      number_of_guest: parseInt(e.target.value),
                    })
                  }
                  value={editedReservation.number_of_guest}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="number_of_rooms">Number of Rooms</label>
                <input
                  type="number"
                  id="number_of_rooms"
                  name="number_of_rooms"
                  onChange={(e) =>
                    setEditedReservation({
                      ...editedReservation,
                      number_of_rooms: parseInt(e.target.value),
                    })
                  }
                  value={editedReservation.number_of_rooms}
                  required
                />
              </div>
              <div className="form-group">{/* ... (other input fields) */}</div>
              <div className="button-grouped">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentReservations;
