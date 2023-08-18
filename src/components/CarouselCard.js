import React, { useState } from "react";
import "../styles/Dashboard.css";
import { BiCaretLeft, BiCaretRight } from "react-icons/bi";
const CarouselCard = ({ images, titles, descriptions }) => {
  const [index, setIndex] = useState(0);

  const handlePrevious = () => {
    setIndex((prevIndex) => (prevIndex + images.length - 3) % images.length);
  };

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex + 3) % images.length);
  };

  return (
    <div className="flex">
      <button onClick={handlePrevious} className="btn">
        <BiCaretLeft />
      </button>
      {images.slice(index, index + 3).map((image, i) => (
        <div className="card w-auto" key={i}>
          <img src={image} className="carousel-image" alt="slide" />
          <div className="card-content">
            <h2>{titles[i + index]}</h2>
            <p>{descriptions[i + index]}</p>
            <button className="btn-booknow"> Reserve </button>
          </div>
        </div>
      ))}
      <button onClick={handleNext} className="btn">
        <BiCaretRight />
      </button>
    </div>
  );
};

export default CarouselCard;
