import "react";
import teampractice from "./assets/teampractice.jpeg";
import nathantaran from "./assets/nathantaran.jpg";

export default function About() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {teampractice} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">About Us</h1>
                </div>
            </div>
            
            <center className = "practiceDiv loadingAnimate">
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

            <div className= "recentDiv loadingAnimate">
                <center className = "titleWrapper">
                    <h1 className = "welcomeTitle">Club Team</h1>
                    <div className= "underline-bar"></div>
                </center>
                <p>Cornell Table Tennis competes in the National Collegiate Table Tennis Association (NCTTA). We send our A (co-ed varsity), B (co-ed junior varsity), and women’s team to regional and national tournaments each year, where we are among the top schools in the upstate NY region. We compete in four tournaments each year, listed below.</p>                    <ul>
                    <li>Fall Divisionals (11/2/24)</li>
                    <li>Spring Divisionals (date TBD)</li>
                    <li>Regionals (date TBD)</li>
                    <li>Nationals (date TBD)</li>
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