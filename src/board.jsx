import 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css'; 

import tt553 from "./assets/headshots/tt553.png";
import cf546 from "./assets/headshots/cf546.jpg";
import kk996 from "./assets/headshots/kk996.jpg";
import mg2479 from "./assets/headshots/mg2479.png";
import acd244 from "./assets/headshots/acd244.jpg";
import gam278 from "./assets/headshots/gam278.jpg";
import hel29 from "./assets/headshots/hel29.jpg";
import esl226 from "./assets/headshots/esl226.jpg";
import nw274 from "./assets/headshots/nw274.jpg";

import nats2024 from "./assets/gallery2.jpg";

export default function Board() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {nats2024} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                <h1 className = "headingTitle">2024-2025 E-Board</h1>
                </div>
            </div>
            <Container className = "boardContainer" fluid="lg">
                <Row>
                    <Col>
                        <Profile
                            name = "Taran Tummala"
                            position = "President"
                            netid = "tt553"
                            bioimage = {tt553}
                            major = {["Biology & Society"]}
                            year = "27"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Gina Fu"
                            position = "Vice President"
                            netid = "cf546"
                            bioimage = {cf546}
                            major = {["Economics", "Statistical Sciences"]}
                            year = "28"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Khai Xin Kuan"
                            position = "Secretary"
                            netid = "kk996"
                            bioimage = {kk996}
                            major = {["Information Science"]}
                            year = "27"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Profile
                            name = "Muskan Gupta"
                            position = "Treasurer"
                            netid = "mg2479"
                            bioimage = {mg2479}
                            major = {["Computer Science"]}
                            year = "28"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Anna Donahue"
                            position = "Publicity Chair"
                            netid = "acd244"
                            bioimage = {acd244}
                            major = {["Industrial and Labor Relations"]}
                            year = "28"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Gordon Mei"
                            position = "Webmaster"
                            netid = "gam278"
                            bioimage = {gam278}
                            major = {["Computer Science", "Mathematics"]}
                            year = "28"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col></Col>
                    <Col>
                        <Profile
                            name = "Heidi Lim"
                            position = "Social Chair"
                            netid = "hel29"
                            bioimage={hel29}
                            major={["Operations Research and Information Engineering"]}
                            year = "28"
                        />
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
            <div className = "pageTitle">
                <h1 className = "loadingAnimate">Hall of Fame</h1>
                <Container className='boardContainer' fluid="lg">
                    <Row>
                        <Col>
                            <Profile
                                name = "Emilie Lin"
                                position = "President"
                                bioimage = {esl226}
                                major = {["Mechanical Engineering"]}
                                year = "24"
                            />
                        </Col>
                        <Col>
                            <Profile
                                name = "Nathan Wu"
                                position = "President"
                                bioimage = {nw274}
                                major = {["Biological Sciences"]}
                                year = "25"
                            />
                        </Col>
                        <Col></Col>
                    </Row>
                </Container>
            </div>
        </>
        
    );
}

// eslint-disable-next-line react/prop-types
function Contact({netid}) {
    if (netid) {
        return <p className = "smaller">Email: {netid}@cornell.edu</p>
    } else {
        return <></>
    }
}

// eslint-disable-next-line react/prop-types
function Profile({name, position, netid, bioimage, major, year}) {
    return (
        <div className = "profileDiv loadingAnimate">
            <img src = {bioimage} className = "bioImages"></img>
            <div className = "bioText">
                <p>{name} &apos;{year}</p>
                <p className="position smaller">{position}</p>
                <Contact netid= {netid}/>
                <p className = "smaller">{getMajor(major)}</p>
            </div>
        </div>
    );
}
function getMajor(majorList) {
    if (majorList.length == 1) {
        return "Major: " + majorList[0];
    }
    return "Majors: " + majorList.join(", ");
}