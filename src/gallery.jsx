import React from "react";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";

import china from './assets/teamchina.jpg';
import fa2024div from './assets/fa2024div.jpg';
import gallery1 from './assets/gallery1.jpg';
import gallery2 from './assets/gallery2.jpg';
import fa2024celeb from './assets/fa2024celeb.jpg';

export default function Gallery() {
    const images = [
        {
          original: gallery1,
          thumbnail: gallery1,
        },
        {
          original: gallery2,
          thumbnail: gallery2,
        },
        {
          original: fa2024div,
          thumbnail: fa2024div,
        },
        {
          original: fa2024celeb,
          thumbnail: fa2024celeb,
        },
      ];
    return (
        <>
            <div className = "pageTitle loadingAnimate">
                <h1>Gallery</h1>
            </div>
            <div className = "loadingAnimate">
              <ImageGallery 
                  items = {images} 
                  showFullscreenButton = {false}
                  showPlayButton = {false}
                  autoPlay = {false}
              />
            </div>
            
        </>
    );
}

