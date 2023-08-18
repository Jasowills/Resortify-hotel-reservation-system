import React from "react";

const EditModal = ({ show, reservation, onClose, onSave, handleChange }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>Edit Reservation</h2>
        <form onSubmit={(e) => onSave(e, reservation.reservation_id)}>
          <label htmlFor="full_name">Full Name:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={reservation.full_name}
            onChange={handleChange}
          />
          {/* Add other input fields here */}
          <button type="submit">Save Changes</button>
        </form>
        <button className="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default EditModal;
