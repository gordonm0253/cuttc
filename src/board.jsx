import React from "react";
import malong from "./assets/malong.jpeg";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './App.css'; 


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
                            name = "Ma Long"
                            position = "Supreme Leader"
                            netid = "ml44"
                            bioimage = {malong}
                            major = {["Biology", "History"]}
                            year = "26"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Ma Long"
                            position = "Supreme Leader"
                            netid = "ml44"
                            bioimage = {malong}
                            major = {["Electrical Engineering"]}
                            year = "27"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Ma Long"
                            position = "Supreme Leader"
                            netid = "ml44"
                            bioimage = {malong}
                            major = {["Computer Science", "Math"]}
                            year = "28"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Profile
                            name = "Ma Long"
                            position = "Supreme Leader"
                            netid = "ml44"
                            bioimage = {malong}
                            major = {["Biology", "History"]}
                            year = "26"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Ma Long"
                            position = "Supreme Leader"
                            netid = "ml44"
                            bioimage = {malong}
                            major = {["Electrical Engineering"]}
                            year = "27"
                        />
                    </Col>
                    <Col>
                        <Profile
                            name = "Ma Long"
                            position = "Supreme Leader"
                            netid = "ml44"
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
        return majorList.join(", ");
    }
    return (
        <div className = "profileDiv">
            <img src = {bioimage} className = "bioImages"></img>
            <div className = "bioText">
                <p>{name} '{year}</p>
                <p>{position}</p>
                <p>Email: {netid}@cornell.edu</p>
                <p>Major(s): {getMajor(major)}</p>
            </div>
        </div>
    );
}