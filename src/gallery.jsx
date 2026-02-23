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
import nats2025_1 from './assets/nats2025_1.jpg';
import nats2025_2 from './assets/nats2025_2.jpg';
import nats2025_3 from './assets/nats2025_3.jpg';
import nats2025_4 from './assets/nats2025_4.jpg';
import nats2025_5 from './assets/nats2025_5.jpg';
import nats2025_6 from './assets/nats2025_6.jpg';
import nats2025_7 from './assets/nats2025_7.jpg';
import nats2025_8 from './assets/nats2025_8.jpg';
import nats2025_9 from './assets/nats2025_9.jpg';
import nats2025_10 from './assets/nats2025_10.jpg';
import nats2025_11 from './assets/nats2025_11.jpg';
import nats2025_12 from './assets/nats2025_12.jpg';
import nats2025_13 from './assets/nats2025_13.jpg';
import nats2025_14 from './assets/nats2025_14.jpg';
import nats2025_15 from './assets/nats2025_15.jpg';
import nats2025_16 from './assets/nats2025_16.jpg';
import nats2025_17 from './assets/nats2025_17.jpg';
import nats2025_18 from './assets/nats2025_18.jpg';
import nats2025_19 from './assets/nats2025_19.jpg';

export default function Gallery() {
    const images = [
      { original: nats2025_1 },
      { original: nats2025_2 },
      { original: nats2025_3 },
      { original: nats2025_4 },
      { original: nats2025_5 },
      { original: nats2025_6 },
      { original: nats2025_7 },
      { original: nats2025_8 },
      { original: nats2025_9 },
      { original: nats2025_10 },
      { original: nats2025_11 },
      { original: nats2025_12 },
      { original: nats2025_13 },
      { original: nats2025_14 },
      { original: nats2025_15 },
      { original: nats2025_16 },
      { original: nats2025_17 },
      { original: nats2025_18 },
      { original: nats2025_19 },
      { original: fa2024div },
      { original: fa2024div1 },
      { original: fa2024div2 },
      { original: fa2024div3 },
      { original: gallery1 },
      { original: gallery2 },
      { original: fa2024celeb },
      { original: team1 },
      { original: nats2024 },
    ];
    return (
        <>
            <div className = "headingDiv">
              <img src = {nats2025_17} className = "headingImage"></img>
              <div className = "headingTitleDiv">
                <h1 className = "headingTitle">Gallery</h1>
              </div>
            </div>
            <div className = "galleryDiv">
              <ImageGallery 
                  items = {images} 
                  showFullscreenButton = {false}
                  showPlayButton = {false}
                  infinite = {true} 
                  autoPlay = {true}
              />
            </div>
        </>
    );
}

