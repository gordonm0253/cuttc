/* eslint-disable react/prop-types */
import 'react';
//import china from './assets/teamchina.jpg';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

//import ateam from './assets/ateam.jpeg';
import placeholder from './assets/big_red.png';
import nats2025_6 from './assets/nats2025_6.jpg';

// headshot imports
import anmol from "./assets/headshots/anmol_headshot.jpg"
import finn from "./assets/headshots/finn_headshot.jpg"
import heidi from "./assets/headshots/heidi_headshot.jpg"
import jerry from "./assets/headshots/jerry_headshot.jpg"
import josh from "./assets/headshots/josh_headshot.jpg"
import kevin from "./assets/headshots/kevin_headshot.jpg"
import lawrence from "./assets/headshots/lawrence_headshot.jpg"
import muskan from "./assets/headshots/muskan_headshot.jpg"
import omar from "./assets/headshots/omar_headshot.jpg"
import sophia from "./assets/headshots/sophia_headshot.jpg"
import taran from "./assets/headshots/taran_headshot.jpg"
import tish from "./assets/headshots/tish_headshot.jpg"
import victor from "./assets/headshots/victor_headshot.jpg"

//import bteam from './assets/bteam.jpg';

// A members = {["Taran Tummala", "Emilie Lin","Nathan Wu", "Janson Chan", "Muskan Gupta", "Gina Fu", "Omar Andújar", "Victor Ren", "Chris Zhang", "Evan Shih"]}
// B members = {["Max Levinson", "Justin Pan", "Henry Yoon", "Alan Liu", "Gordon Mei", "Elliot Chow", "Nico Ma", "Meris Goldfarb", "Oliver Wu"]}
// W members = {["Emilie Lin", "Muskan Gupta", "Gina Fu", "Surabhi Shastry", "Heidi Lim", "Anna Donahue", "Khai Xin Kuan", "Bea Buenaventura", "Judy Wang"]} 


const ab_team = {
    name : "A/B Team",
    members : ["Taran Tummala", "Justin Pan", "Victor Ren", "Omar Andujar","Henry Yoon", "Alan Liu", "Gordon Mei", 
                "Meris Goldfarb", "Finn Woodman", "Anmol Karan", "Joshua Cohen",
                "Kevin Chow", "Jerry Mao", "Lawrence Liu", "Tianshi Zhou", "Yiguo Qin", "Diego Khayat"],
    images: {
        "Taran Tummala": taran, 
        "Finn Woodman": finn,
        "Anmol Karan": anmol, 
        "Joshua Cohen": josh,
        "Kevin Chow": kevin,
        "Jerry Mao": jerry,
        "Lawrence Liu": lawrence,
        "Tianshi Zhou": tish,
        "Victor Ren": victor,
        "Omar Andujar": omar,
    }
}

const w_team = {
    name : "Women's Team",
    members : ["Muskan Gupta", "Gina Fu", "Sophia Zhou", "Heidi Lim", "Anna Donahue", "Khai Xin Kuan", "Surabhi Shastry", "Michelle Liang"],
    images: {
        "Muskan Gupta": muskan,
        "Sophia Zhou": sophia, 
        "Heidi Lim": heidi
    }
}

// <TeamCard team = {a_team} />

export default function Team() {
    return (
        <>
            <div className = "headingDiv">
                <img src = {nats2025_6} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">Club Team</h1>
                </div>
            </div>
            
            <TeamCard team = {ab_team} />
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
                    <MemberCard name={member} image={team.images?.[member] ?? placeholder} />
                    </Col>
                ))}
                </Row>
            </Container>
        </div>
    );
}


function MemberCard({name, image}) {
    if (name === "") {
        return (
            <div></div>
        );
    }
    return (
        <div className = "memberCard">
            <img src = {image} className = "memberImage"></img>
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