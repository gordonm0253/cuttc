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
            
            <center className = "recentDiv redBorder loadingAnimate">
                <div className = "titleWrapper">
                        <h1 className = "welcomeTitle">Join us for open play!</h1>
                        <div className= "underline-bar-shorter"></div>
                </div>
                <p>
                    The club meets each week for open practice from <b>4:00-6:00 PM on Saturdays at Appel Commons 303ABC </b>
                    (upstairs from North Star dining hall). We&apos;ll have tables set up, so bring a friend to play or meet 
                    some new people! We will provide paddles and balls (but feel free to bring your own equipment). 
                </p>
                <p>
                    Below is our open practice schedule for the fall 2025 semester! We hope to see you there!
                </p>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "1rem"
                    }}
                    >
                    <iframe
                        src="https://calendar.google.com/calendar/embed?src=c_f1d24418ff519a8279d96a072825552a0a1544dc0857adaca8efc5e835ebd6dc%40group.calendar.google.com&ctz=America%2FNew_York"
                        style={{
                        border: 0,
                        width: "100%",
                        maxWidth: "900px",
                        height: "650px",
                        }}
                    />
                </div>
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
            </div>
        </>
    );
}