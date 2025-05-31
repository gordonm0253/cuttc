import "react";
import nats2024 from './assets/nats2024.jpg';
import nats2025_1 from './assets/nats2025_1.jpg';
import nats2025_19 from './assets/nats2025_19.jpg';
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
                <p>From April 3rd-6th, the Cornell A and women's team traveled UW Health Sports Factory in Rockford, Illinois to compete in the NCTTA National Championships against the best collegiate teams in the country. 
                    Congratulations to our women's team, who finished 2nd in the nation! Our A team also finished 8th place. </p>
                <ul>
                    <li>Cornell A: Nathan Wu, Taran Tummala, Gina Fu, Muskan Gupta, Janson Chan</li>
                    <li>Cornell Women's: Gina Fu, Muskan Gupta, Surabhi Shastry, Heidi Lim</li>
                </ul>
                <p>
                    Congratulations to our graduating seniors - Nathan Wu, Janson Chan, Maxwell Levinson, and Emilie Lin. We thank you all for your hard work and dedication to the club, and will certainly miss you next year. 
                </p>
                <div className = "doubleImageContainer">
                    <div className= "image-container">
                        <img src = {nats2025_1} />
                    </div>
                    <div className= "image-container">
                        <img src = {nats2025_19} />
                    </div>
                </div>
                
                <p className = "homeGalleryText">
                    Check out our <Link to = "/gallery" className = "redlink">Gallery</Link> for more tournament pictures!
                </p>
            </div>
        </>
    );
}
