import "react";
//import teampractice from "./assets/teampractice.jpeg";
import nathantaran from "./assets/nathantaran.jpg";
import nats2024 from './assets/gallery2.jpg';

export default function About() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {nats2024} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">About Us</h1>
                </div>
            </div>
            
            <center className = "contentDiv redBorder loadingAnimate">
                <div className = "titleWrapper">
                        <h1 className = "welcomeTitle">Join us for open play!</h1>
                        <div className= "underline-bar-shorter"></div>
                </div>
                <p>
                    The club meets each week for open practice from <b>1-3 PM on Saturdays at Appel Commons 303ABC </b>
                    (upstairs from North Star dining hall). We&apos;ll have tables set up, so bring a friend to play or meet 
                    some new people! We will provide paddles and balls (but feel free to bring your own equipment).
                </p>
            </center>

            <div className= "recentDiv redBorder loadingAnimate">
                <center>
                    <div className = "titleWrapper">
                        <h1 className = "welcomeTitle">Club Team</h1>
                        <div className= "underline-bar"></div>
                    </div>
                </center>
                
                <p>Cornell Table Tennis competes in the National Collegiate Table Tennis Association (NCTTA). We send our A (co-ed varsity), B (co-ed junior varsity), and women’s team to regional and national tournaments each year, where we are among the top schools in the upstate NY region. We compete in four tournaments each year, listed below.</p>                    <ul>
                    <li>Fall Divisionals</li>
                    <li>Spring Divisionals</li>
                    <li>Regionals</li>
                    <li>Nationals</li>
                </ul>
                <div className = "image-container">
                    <img src = {nathantaran} />
                </div>
                <p>
                    We will host our next tryouts at the beginning of the fall 2025 semester. Stay tuned for more information!
                </p>  
            </div>
        </>
    );
}