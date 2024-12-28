import React from "react";
import china from './assets/teamchina.jpg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Team() {
    return (
        <>
            <div className = "pageTitle">
                <h1>Current Team</h1>
            </div>
            <Description
                teamName = "A Team"
                members = {["Ma Long", "Xu Xin", "Fan Zhendong", "Chen Meng*"]}
                teamPicture = {china}
                additionalInfo = "* also members of the women's team"
                textAlign = "left"
            />
            <Description
                teamName = "B Team"
                members = {["Ma Long", "Xu Xin", "Fan Zhendong", "Chen Meng*"]}
                teamPicture = {china}
                textAlign = "right"
            />
            <Description
                teamName = "Women's Team"
                members = {["Ma Long", "Xu Xin", "Fan Zhendong", "Chen Meng"]}
                teamPicture = {china}
                textAlign = "left"
            />
        </>
    );
}

function Description({teamName, members, teamPicture, additionalInfo, textAlign}) {
    if (textAlign == 'left') {
        return (
            <div className = "teamSectionDiv">
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
            <div className = "teamSectionDiv">
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
            <h2>{teamName}</h2>
            <ul>{listedTeam}</ul>
            <p>{additionalInfo}</p>
        </div>
    );
}