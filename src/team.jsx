/* eslint-disable react/prop-types */
import 'react';
//import china from './assets/teamchina.jpg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

//import ateam from './assets/ateam.jpeg';
import placeholder from './assets/big_red.png';
import nats2025_6 from './assets/nats2025_6.jpg';
//import bteam from './assets/bteam.jpg';

// A members = {["Taran Tummala", "Emilie Lin","Nathan Wu", "Janson Chan", "Muskan Gupta", "Gina Fu", "Omar Andújar", "Victor Ren", "Chris Zhang", "Evan Shih"]}
// B members = {["Max Levinson", "Justin Pan", "Henry Yoon", "Alan Liu", "Gordon Mei", "Elliot Chow", "Nico Ma", "Meris Goldfarb", "Oliver Wu"]}
// W members = {["Emilie Lin", "Muskan Gupta", "Gina Fu", "Surabhi Shastry", "Heidi Lim", "Anna Donahue", "Khai Xin Kuan", "Bea Buenaventura", "Judy Wang"]} 

const a_team = {
    name : "A Team",
    members : ["Taran Tummala", "Muskan Gupta", "Gina Fu"]
}


const b_team = {
    name : "B Team",
    members : ["Justin Pan", "Henry Yoon", "Alan Liu", "Gordon Mei", "Meris Goldfarb", "Finn Woodman"]
}

const w_team = {
    name : "Women's Team",
    members : ["Muskan Gupta", "Gina Fu", "Sophia Zhou", "Heidi Lim", "Anna Donahue", "Khai Xin Kuan", "Surabhi Shastry"]
}


export default function Team() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {nats2025_6} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">Club Team</h1>
                </div>
            </div>
            <TeamCard team = {a_team} />
            <TeamCard team = {b_team} />
            <TeamCard team = {w_team} />
        </>
    );
}

function TeamCard({team}) {
    let rows = Math.ceil(team.members.length / 5);
    let res = [];
    for (let i = 0; i < rows; i++) {
        let curr = [];
        for (let j = 0; j < 5; j++) {
            if (i * 5 + j < team.members.length) {
                curr.push(team.members[i * 5 + j]);
            } else {
                curr.push("");
            }
        }
        res.push(curr);
    }
    return (
        <div className="teamCard">
            <h1>{team.name}</h1>
            <Container>
                <Row className="justify-content-center">
                {team.members.map((member) => (
                    <Col
                    key={member}
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    className="d-flex justify-content-center mb-4"
                    >
                    <MemberCard name={member} />
                    </Col>
                ))}
                </Row>
            </Container>
        </div>
    );
}


function MemberCard({name}) {
    if (name === "") {
        return (
            <div></div>
        );
    }
    return (
        <div className = "memberCard">
            <img src = {placeholder} className = "memberImage"></img>
            <p>{name}</p>
        </div>
    );
}    
/*
function MemberCard(member) {
    return (
        <div className = "memberCard">
            <img src = {member.image} className = "memberImage"></img>
            <h1>{member.name}</h1>
            <p>{member.major}</p>
            <p>{member.year}</p>
        </div>
    );
}
*/