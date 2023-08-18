import React from "react";
import CarouselCard from "./CarouselCard";
const images = [
  "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?cs=srgb&dl=pexels-pixabay-164595.jpg&fm=jpg",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&w=1000&q=80",
  "https://i0.wp.com/businessday.ng/wp-content/uploads/2021/03/business-suite.jpg?fit=712%2C401&ssl=1",
  "https://hoteldel.com/wp-content/uploads/2021/03/hotel-del-coronado-views-suite-K1TOS1-K1TOJ1-1600x1000-1.jpg",
  "https://www.welcome-hotels.com/site/assets/files/35059/welcome_hotel_marburg_lobby_2k.2560x1600.jpg",
  "https://www.travelandleisure.com/thmb/wMsbzLsD9fyrpBNZlV1r2rY_vIw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/hotel-brands-leela-goa-00-HOTELBRANDSWB21-209f611fdaa44d1c98d0ee0c84428209.jpg",
];

const titles = [
  "Executive Suites",
  "Presidential Suites",
  "Standard Suite",
  "Studio",
  "Family Room",
  "Capsule Hotel",
];

const descriptions = [
  " A premium and spacious hotel accommodation designed for business travelers and those seeking enhanced comfort.",
  "An ultra-luxurious and exclusive hotel room with multiple bedrooms, lavish amenities, and personalized services, catering to VIPs and dignitaries.",
  "A spacious hotel room with a separate living area, offering more comfort and amenities than a regular room",
  " A compact and versatile living space that combines a bedroom, living area, and kitchenette into a single open-concept room",
  "A larger hotel room designed to accommodate families, featuring multiple beds and kid-friendly amenities.",
  "A compact and affordable lodging option with individual sleeping pods, shared facilities, and minimalist design",
];

const App = () => {
  return (
    <div>
      <CarouselCard
        images={images}
        titles={titles}
        descriptions={descriptions}
      />
    </div>
  );
};

export default App;
