import React from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css'; 

import malong from "./assets/malong.jpeg";
import tt553 from "./assets/tt553.png";


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
                            bioimage = {malong}
                            major = {["Economics", "Statistics?"]}
                            year = "28"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Khai Xin Kuan"
                            position = "Secretary"
                            netid = "kk996"
                            bioimage = {malong}
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
                            bioimage = {malong}
                            major = {["Computer Science"]}
                            year = "28"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Anna Donahue"
                            position = "Publicity Chair"
                            netid = "acd244"
                            bioimage = {malong}
                            major = {["ILR?"]}
                            year = "28"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Gordon Mei"
                            position = "Webmaster"
                            netid = "gam278"
                            bioimage = {malong}
                            major = {["Computer Science", "Math"]}
                            year = "28"
                        />
                    </Col>
                </Row>
            </Container>
        </>
        
    );
}



function Profile({name, position, netid, bioimage, major, year}) {
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
                <p>{name} '{year}</p>
                <p className="position">{position}</p>
                <p>Email: {netid}@cornell.edu</p>
                <p>{getMajor(major)}</p>
            </div>
        </div>
    );
}