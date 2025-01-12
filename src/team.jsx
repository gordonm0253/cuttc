import React from "react";
import china from './assets/teamchina.jpg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Team() {
    return (
        <>
            <div className = "pageTitle loadingAnimate">
                <h1>Current Team</h1>
            </div>
            <Description
                teamName = "A Team"
                members = {["Taran Tummala", "Emilie Lin","Nathan Wu", "Janson Chan", "Muskan Gupta", "Gina Fu", "Omar Andújar", "Victor Ren", "Chris Zhang", "Evan Shih"]}
                teamPicture = {china}
                textAlign = "left"
            />
            <Description
                teamName = "B Team"
                members = {["Max Levinson", "Justin Pan", "Henry Yoon", "Alan Liu", "Gordon Mei", "Elliot Chow", "Nico Ma", "Meris Goldfarb", "Oliver Wu"]}
                teamPicture = {china}
                textAlign = "right"
            />
            <Description
                teamName = "Women's Team"
                members = {["Emilie Lin", "Muskan Gupta", "Gina Fu", "Surabhi Shastry", "Heidi Lim", "Anna Donahue", "Khai Xin Kuan", "Bea Buenaventura", "Judy Wang"]}
                teamPicture = {china}
                textAlign = "left"
            />
        </>
    );
}

function Description({teamName, members, teamPicture, additionalInfo, textAlign}) {
    if (textAlign == 'left') {
        return (
            <div className = "teamSectionDiv loadingAnimate">
                <Container>
                    <Row>
                        <Col>
                            <TeamTextDiv
                                teamName = {teamName}
                                teamList = {members}
                                additionalInfo = {additionalInfo}
                            />
                        </Col>
                        <Col>
                            <div className = "teamImageDiv">
                                <img src = {teamPicture} className = "teamPicture"/>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    } else {
        
        return (
            <div className = "teamSectionDiv loadingAnimate">
            <Container>
                <Row>
                    <Col>
                        <div className = "teamImageDiv">
                            <img src = {teamPicture} className = "teamPicture"/>
                        </div>
                    </Col>
                    <Col>
                        <TeamTextDiv
                            teamName = {teamName}
                            teamList = {members}
                            additionalInfo = {additionalInfo}
                        />
                    </Col>
                    
                </Row>
            </Container>
        </div>
        );
    }
}
function TeamTextDiv({teamName, teamList, additionalInfo}) {
    const listedTeam = teamList.map(member => <div className = "teamListDiv"><p>{member}</p></div>);
    return (
        <div className= "teamTextDiv">
            <h2><b>{teamName}</b></h2>
            <div>{listedTeam}</div>
            <p>{additionalInfo}</p>
        </div>
    );
}