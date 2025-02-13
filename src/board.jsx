import "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css'; 

import tt553 from "./assets/tt553.png";
import cf546 from "./assets/cf546.jpg";
import kk996 from "./assets/kk996.jpg";
import mg2479 from "./assets/mg2479.png";
import acd244 from "./assets/acd244.jpg";
import gam278 from "./assets/gam278.jpg";

export default function Board() {
    return (
        <>
            <div className = "pageTitle">
                <h1>2024-2025 E-Board</h1>
            </div>
            <Container fluid="lg">
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
            </Container>
        </>
        
    );
}



function Profile(name, position, netid, bioimage, major, year) {
    function getMajor(majorList) {
        if (majorList.length == 1) {
            return "Major: " + majorList[0];
        }
        return "Majors: " + majorList.join(", ");
    }
    return (
        <div className = "profileDiv loadingAnimate">
            <img src = {bioimage} className = "bioImages"></img>
            <div className = "bioText">
                <p>{name} &apos;{year}</p>
                <p className="position smaller">{position}</p>
                <p className = "smaller">Email: {netid}@cornell.edu</p>
                <p className = "smaller">{getMajor(major)}</p>
            </div>
        </div>
    );
}