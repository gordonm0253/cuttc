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

            <center className = "contentDiv redBorder loadingAnimate">
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
                            The club meets each week for open practice. Sign up on <a target = "_blank" href = "https://cornell.campusgroups.com/CTTC/club_signup" className="redlink">CampusGroups</a> and join us from 4:00-6:00 PM on Saturdays at Appel Commons!
                            You can join our 25-26 GroupMe <a target = "_blank" href = "https://groupme.com/join_group/103997327/0gKV72gZ" className="redlink">here</a> for more updates! Check the <Link to = "/about" className = "redlink">About Us</Link> page for more information on practices.
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
            <div className = "recentDiv redBorder loadingAnimate">
                <div className = "titleWrapper">
                    <h1 className = "welcomeTitle">Tryouts</h1>
                    <div className= "underline-bar"></div>
                </div>
                <p className = "contentP">
                    Tryouts will be held on September 20th (Saturday) from 7:15 to 9:15pm and September 21st (Sunday) from 5:15-7:15pm in Appel 303ABC, the top floor of Appel. You will only be trying out one on of these days, and there may be additional rounds based on the number of people trying out. 
                    Please fill out the <a href = "https://docs.google.com/forms/d/e/1FAIpQLScThPIzVZwlrqmbqO2zzeW4lFH03HaO66GHqwl2Smox3DIIyQ/viewform" target = "_blank" className="redlink" >form</a> to register. You MUST fill out the form in order to tryout.
                </p>
                <p>
                    You do not need to have a paddle or any equipment to tryout, but we have limited paddles so you will likely need to share if you do not bring your own. If you have any questions, feel free to reach out to Cornelluniversityttc [at] gmail [dot] com. We look forward to seeing everyone there!
                </p>
            </div>
            <div className = "recentDiv redBorder loadingAnimate">
                <div className = "titleWrapper">
                        <h1 className = "welcomeTitle">Recent News</h1>
                        <div className= "underline-bar"></div>
                </div>
                <p>From April 3rd-6th, the Cornell A and women's team traveled UW Health Sports Factory in Rockford, Illinois to compete in the NCTTA National Championships against the best collegiate teams in the country. 
                    A huge congratulations to our women's team, who finished 2nd in the nation! Our A team also finished 8th place. </p>
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
