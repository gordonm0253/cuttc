/* eslint-disable react/prop-types */
import 'react';
import './App.css';
import './people.css';

import tt553 from "./assets/headshots/tt553.png";
import mg2479 from "./assets/headshots/mg2479.png";
import gam278 from "./assets/headshots/gam278.jpg";
import hel29 from "./assets/headshots/hel29.jpg";
import esl226 from "./assets/headshots/esl226.jpg";
import nw274 from "./assets/headshots/nw274.jpg";
import jmc746 from "./assets/headshots/josh_headshot.jpg";
import klc299 from "./assets/headshots/kevin_headshot.jpg";
import jqm5 from "./assets/headshots/jerry_headshot.jpg";

import nats2025_15 from "./assets/nats2025_15.jpg";

const boardMembers = [
    { name: "Muskan Gupta", position: "Co-President", netid: "mg2479", bioimage: mg2479, major: ["Computer Science"], year: "28" },
    { name: "Heidi Lim", position: "Co-President", netid: "hel29", bioimage: hel29, major: ["Operations Research and Information Engineering"], year: "28" },
    { name: "Kevin Chow", position: "Treasurer", netid: "klc299", bioimage: klc299, major: ["Food Science"], year: "28" },
    { name: "Joshua Cohen", position: "Social Chair", netid: "jmc746", bioimage: jmc746, major: ["Industrial and Labor Relations"], year: "29" },
    { name: "Jerry Mao", position: "Social Chair", netid: "jqm5", bioimage: jqm5, major: ["Applied Economics & Management"], year: "28" },
    { name: "Gordon Mei", position: "Webmaster", netid: "gam278", bioimage: gam278, major: ["Computer Science", "Mathematics"], year: "28" },
];

const hofMembers = [
    { name: "Emilie Lin", position: "President", bioimage: esl226, major: ["Mechanical Engineering"], year: "24" },
    { name: "Nathan Wu", position: "President", bioimage: nw274, major: ["Biological Sciences"], year: "25" },
    { name: "Taran Tummala", position: "President", bioimage: tt553, major: ["Biology and Society"], year: "27" },
];

export default function Board() {
    return (
        <div className="peoplePage">
            <div className="headingDiv">
                <img src={nats2025_15} className="headingImage"></img>
                <div className="headingTitleDiv">
                    <h1 className="headingTitle">2025-2026 E-Board</h1>
                </div>
            </div>

            <SectionHead num="01" kicker="Executive Board" note="Hover a portrait for the details." />
            <div className="boardGrid">
                {boardMembers.map(member => <BoardCard key={member.netid} {...member} />)}
            </div>

            <SectionHead num="02" kicker="Hall of Fame" />
            <div className="boardGrid">
                {hofMembers.map(member => <BoardCard key={member.name} {...member} />)}
            </div>
        </div>
    );
}

export function SectionHead({ num, kicker, title, note }) {
    return (
        <>
            <div className="peopleSectionHead">
                <div>
                    <div className="peopleSectionNum">{num} — {kicker}</div>
                    {title && <h2>{title}</h2>}
                </div>
                {note && <div className="peopleSectionNote">{note}</div>}
            </div>
            <div className="peopleRule" />
        </>
    );
}

function BoardCard({ name, position, netid, bioimage, major, year }) {
    const email = netid ? `${netid}@cornell.edu` : null;
    return (
        <div className="boardCard">
            <div
                className="boardPortrait"
                role="img"
                aria-label={name}
                style={{ backgroundImage: `url(${bioimage})` }}
            >
                <div className="boardReveal">
                    <p className="boardRevealLabel">Class of</p>
                    <p className="boardRevealValue">20{year}</p>
                    <div className="boardRevealDivider" />
                    <p className="boardRevealLabel">{major.length > 1 ? "Majors" : "Major"}</p>
                    <p className="boardRevealValue">{major.join(" + ")}</p>
                    {email && (
                        <>
                            <div className="boardRevealDivider" />
                            <p className="boardRevealLabel">Contact</p>
                            <p className="boardRevealEmail"><a href={`mailto:${email}`}>{email}</a></p>
                        </>
                    )}
                </div>
            </div>
            <div className="boardMeta">
                <p className="boardName">{name}</p>
                <p className="boardPosition">{position}</p>
            </div>
        </div>
    );
}
