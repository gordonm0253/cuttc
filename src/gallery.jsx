import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";

import fa2024div from './assets/fa2024div.jpg';
import fa2024div1 from './assets/fa2024div1.jpg';
import fa2024div2 from './assets/fa2024div2.jpg';
import fa2024div3 from './assets/fa2024div3.jpg';
import gallery1 from './assets/gallery1.jpg';
import gallery2 from './assets/gallery2.jpg';
import fa2024celeb from './assets/fa2024celeb.jpg';
import team1 from './assets/teampic1.jpg';
import nats2024 from './assets/nats2024.jpg';

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
          original: fa2024div1,
          thumbnail: fa2024div1,
        },
        {
          original: fa2024div2,
          thumbnail: fa2024div2,
        },
        {
          original: fa2024div3,
          thumbnail: fa2024div3,
        },
        {
          original: fa2024celeb,
          thumbnail: fa2024celeb,
        },
        {
          original: team1,
          thumbnail: team1,
        },
      ];
    return (
        <>
            <div className = "headingDiv">
              <img src = {nats2024} className = "headingImage"></img>
              <div className = "headingTitleDiv">
                <h1 className = "headingTitle">Gallery</h1>
              </div>
            </div>
            <div className = "galleryDiv">
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

