import "react";
import nats2024 from './assets/nats2024.jpg';
import fadiv2024_1 from './assets/fa2024div.jpg';
import fadiv2024_2 from './assets/fa2024div1.jpg';
import nathan from './assets/gallery1.jpg'; 
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {nats2024} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">Cornell Table Tennis</h1>
                </div>
            </div>

            <center className = "contentDiv loadingAnimate">
                <div className = "LRContainer">
                    <div className = "text-container">
                        <div className = "titleWrapper">
                            <h1 className = "welcomeTitle">Welcome!</h1>
                            <div className="underline-bar"></div>
                        </div>
                        <p>
                            Cornell Table Tennis Club is a registered student organization of Cornell University. 
                            We invite players of all skill levels to our practices to have fun and improve their skills. 
                            Our club teams also compete in NCTTA (National Collegiate Table Tennis Association) regional and 
                            national tournaments each year.
                        </p>
                        <p>
                            The club meets each week for open practice. Sign up on <a target = "_blank" href = "https://cornell.campusgroups.com/CTTC/club_signup" className="redlink">CampusGroups</a> and join us from 1-3 PM on Saturdays at Appel Commons!
                            Check the <Link to = "/about" className = "redlink">About Us</Link> page for more information on practices.
                        </p>
                        <Link to = "/about">
                            <button className= "red-button">Learn More</button>
                        </Link>
                        

                    </div>
                    <div className = "image-container">
                        <img src = {nathan} className = "welcomeImage"></img>
                    </div>
                    
                </div>
            </center>
            <div className = "recentDiv loadingAnimate">
                <div className = "titleWrapper">
                        <h1 className = "welcomeTitle">Recent News</h1>
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
                
                <p className = "homeGalleryText">
                    Check out our <Link to = "/gallery" className = "redlink">Gallery</Link> for more tournament pictures!
                </p>
            </div>
        </>
    );
}
