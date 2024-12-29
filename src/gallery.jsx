import React from "react";
import "react-image-gallery/styles/css/image-gallery.css";
import china from './assets/teamchina.jpg';
import fa2024div from './assets/fa2024div.jpg';
import ImageGallery from "react-image-gallery";



export default function Gallery() {
    const images = [
        {
          original: china,
          thumbnail: china,
        },
        {
          original: fa2024div,
          thumbnail: fa2024div,
        },
      ];
    return (
        <>
            <div className = "pageTitle">
                <h1>Gallery</h1>
            </div>
            <ImageGallery 
                items = {images} 
                showFullscreenButton = {false}
                showPlayButton = {false}
                autoPlay = {false}
            />
        </>
    );
}

