import React, { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";

const ReservationForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    type_of_room: "",
    checkIn_date: "",
    checkOut_date: "",
    number_of_guest: 1,
    number_of_rooms: 1,
  });

  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(formData.full_name)) {
      enqueueSnackbar("Full name must contain only letters.", {
        variant: "error",
        style: { marginLeft: "350px" },
        className: "snackbar",
        position: "top-right",
      });

      return;
    }

    if (!emailRegex.test(formData.email)) {
      enqueueSnackbar("Please enter a valid email address.", {
        variant: "error",
        style: { marginLeft: "350px" },
        className: "snackbar",
        position: "top-right",
      });

      return;
    }

    if (formData.checkIn_date > formData.checkOut_date) {
      enqueueSnackbar("Check-out date must be after check-in date.", {
        variant: "error",
        style: { marginLeft: "350px" },
        className: "snackbar",
        position: "top-right",
      });

      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/reservations",
        {
          ...formData,
          number_of_guest: guests,
          number_of_rooms: rooms,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newReservation = response.data;
      const reservationData = localStorage.getItem("reservationData");
      if (reservationData) {
        try {
          const parsedData = JSON.parse(reservationData);
          if (parsedData && parsedData.data) {
            const updatedReservations = [...parsedData.data, newReservation];
            localStorage.setItem(
              "reservationData",
              JSON.stringify({ data: updatedReservations })
            );
          }
        } catch (error) {
          console.error("Error parsing reservation data:", error);
        }
      } else {
        localStorage.setItem(
          "reservationData",
          JSON.stringify({ data: [newReservation] })
        );
      }

      enqueueSnackbar("Reservation created successfully", {
        variant: "success",
        style: { marginLeft: "350px" },
        position: "top-right",
        className: "snackbar",
      });
       window.location.reload();
      setFormData({
        full_name: "",
        email: "",
        phone_number: "",
        type_of_room: "",
        checkIn_date: "",
        checkOut_date: "",
        number_of_guest: 1,
        number_of_rooms: 1,
      });

      setGuests(1);
      setRooms(1);
      console.log("Reservation created:", response.data);
    } catch (error) {
      console.error("Error creating reservation:", error);
    }
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleGuestsIncrement = () => {
    setGuests((prevGuests) => prevGuests + 1);
  };

  const handleGuestsDecrement = () => {
    if (guests > 1) {
      setGuests((prevGuests) => prevGuests - 1);
    }
  };

  const handleRoomsIncrement = () => {
    setRooms((prevRooms) => prevRooms + 1);
  };

  const handleRoomsDecrement = () => {
    if (rooms > 1) {
      setRooms((prevRooms) => prevRooms - 1);
    }
  };

  return (
    <section className="hotel-search-container">
      <form className="inputs" onSubmit={handleSubmit}>
        <h2>Make a Reservation</h2>
        <div className="input-wrapper">
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-wrapper">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-wrapper">
          <input
            type="number"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-wrapper roomType-container">
          <select
            id="roomType"
            name="type_of_room"
            value={formData.type_of_room}
            onChange={handleInputChange}
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
        <div className="input-wrapper">
          <label htmlFor="checkIn">Check-In</label>
          <input
            type="date"
            name="checkIn_date"
            id="checkIn"
            value={formData.checkIn_date}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="checkOut">Check-Out</label>
          <input
            type="date"
            name="checkOut_date"
            id="checkOut"
            value={formData.checkOut_date}
            onChange={handleInputChange}
          />
        </div>
        <div className="dropdown-wrapper">
          <label htmlFor="guestsAndRooms">&nbsp;</label>
          <div className={`dropdown ${dropdownVisible ? "active" : ""}`}>
            <button
              className="dropdown-toggle"
              type="button"
              onClick={toggleDropdown}
            >
              {guests} Guests, {rooms} Rooms
            </button>
            <div className="dropdown-content">
              <div className="increment-decrement">
                <p>Guest</p>
                <div className="button-group">
                  <button type="button" onClick={handleGuestsDecrement}>
                    -
                  </button>
                  <span>{guests}</span>
                  <button
                    type="button"
                    className="increment"
                    onClick={handleGuestsIncrement}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="increment-decrement">
                <p>Rooms</p>
                <div className="button-group">
                  <button type="button" onClick={handleRoomsDecrement}>
                    -
                  </button>
                  <span>{rooms}</span>
                  <button
                    type="button"
                    className="increment"
                    onClick={handleRoomsIncrement}
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="apply-button" onClick={toggleDropdown}>
                Apply
              </p>
            </div>
          </div>
        </div>
        <div className="button-container">
          <button type="submit" className="search-button">
            Reserve
          </button>
        </div>
      </form>
    </section>
  );
};

export default ReservationForm;
