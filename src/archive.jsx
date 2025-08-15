import "react";
import landingImage from "./assets/nats2025_5.jpg";
import fadiv2024_1 from './assets/fa2024div.jpg';
import fadiv2024_2 from './assets/fa2024div1.jpg';

export default function Archive() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {landingImage} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                <h1 className = "headingTitle">Tournament Archive</h1>
                </div>
            </div>
            <div className = "redBorder archiveDiv loadingAnimate">
                <div className = "titleWrapper">
                        <h1 className = "welcomeTitle">Fall 2024 Divisionals</h1>
                        <div className= "underline-bar"></div>
                </div>
                <p>On November 2nd, the A, B, and women’s teams traveled to Elevate Fitness in Syracuse to compete in the NCTTA Upstate NY fall divisionals (West NY division). All 3 teams went undefeated in their matches, facing teams from RIT, SUNY Buffalo, and more. Our next tournament will be the spring divisionals, where we will also send our A, B, and women’s teams.</p>
                <ul>
                    <li>Cornell A: def. SUNY Buffalo A (4-0), def. RIT A (4-0), def. Rochester A (4-0)</li>
                    <li>Cornell B: def. SUNY Buffalo B (3-1), def. RIT B (3-1), def. Binghamton W (4-0)</li>
                    <li>Cornell Women: def. Rochester W (4-0), def. RIT B (3-1), def. Binghamton W (4-0)</li>
                </ul>
                <div className = "doubleImageContainer">
                    <div className= "image-container">
                        <img src = {fadiv2024_1} />
                    </div>
                    <div className= "image-container">
                        <img src = {fadiv2024_2} />
                    </div>
                </div>
            </div>
        </>
    )
}