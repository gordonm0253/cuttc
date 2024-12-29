import React from "react";
import fa2024div from './assets/cropped.jpg';
import div2024 from './assets/fa2024div.jpg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Home() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {fa2024div} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">Cornell Table Tennis</h1>
                </div>
                
            </div>
            <div className = "welcomeDiv">
                <h1>
                    Welcome!
                </h1>
                <p>
                    Cornell Table Tennis Club is a registered student organization of Cornell University. 
                    We invite players of all skill levels to our practices to have fun and improve their skills. 
                    Our club teams also compete in NCTTA (National Collegiate Table Tennis Association) regional and 
                    national tournaments each year.
                </p>
                <p>
                    The club meets each week for open practice. Sign up on CampusGroups and join us from 1-3 PM on Saturdays in
                    room?!
                    Check the <a href="/about">About Us</a> page for more information.
                </p>
                
            </div>
            <div className = "recentDiv">
                <h1>
                    Recent News
                </h1>
                <p>This is a paragraph explaining a list of items:</p>
                <ul>
                    <li>First item in the list</li>
                    <li>Second item in the list</li>
                    <li>Third item in the list</li>
                    <li>Fourth item in the list</li>
                </ul>
                <div className= "recentImageDiv">
                    <img src = {div2024} />
                </div>
                <p className = "homeGalleryText">
                    Check out our <a href = "/gallery">Gallery</a> for more tournament pictures!
                </p>
            </div>
        </>
    );
}
