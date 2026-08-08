/* eslint-disable react/prop-types */
import 'react';
import './App.css';
import './people.css';
import { SectionHead } from './board.jsx';

import placeholder from './assets/big_red.png';
import nats2025_6 from './assets/nats2025_6.jpg';

// headshot imports
import anmol from "./assets/headshots/anmol_headshot.jpg";
import finn from "./assets/headshots/finn_headshot.jpg";
import heidi from "./assets/headshots/heidi_headshot.jpg";
import jerry from "./assets/headshots/jerry_headshot.jpg";
import josh from "./assets/headshots/josh_headshot.jpg";
import kevin from "./assets/headshots/kevin_headshot.jpg";
import lawrence from "./assets/headshots/lawrence_headshot.jpg";
import muskan from "./assets/headshots/muskan_headshot.jpg";
import omar from "./assets/headshots/omar_headshot.jpg";
import sophia from "./assets/headshots/sophia_headshot.jpg";
import taran from "./assets/headshots/taran_headshot.jpg";
import tish from "./assets/headshots/tish_headshot.jpg";
import victor from "./assets/headshots/victor_headshot.jpg";

const ab_team = {
    name: "A/B Team",
    members: ["Taran Tummala", "Justin Pan", "Victor Ren", "Omar Andujar", "Henry Yoon", "Alan Liu", "Gordon Mei",
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
};

const w_team = {
    name: "Women's Team",
    members: ["Muskan Gupta", "Gina Fu", "Sophia Zhou", "Heidi Lim", "Anna Donahue", "Khai Xin Kuan", "Surabhi Shastry", "Michelle Liang"],
    images: {
        "Muskan Gupta": muskan,
        "Sophia Zhou": sophia,
        "Heidi Lim": heidi
    }
};

export default function Team() {
    return (
        <div className="peoplePage">
            <div className="headingDiv">
                <img src={nats2025_6} className="headingImage"></img>
                <div className="headingTitleDiv">
                    <h1 className="headingTitle">Club Team</h1>
                </div>
            </div>

            <SectionHead num="01" kicker="Club Team" title="Competitive rosters" note="A/B and Women’s squads." />
            <TeamRoster team={ab_team} />
            <TeamRoster team={w_team} />
        </div>
    );
}

function TeamRoster({ team }) {
    return (
        <div className="rosterBlock">
            <div className="rosterHead">
                <h3>{team.name}</h3>
                <span className="rosterCount">{team.members.length} players</span>
                <span className="rosterLine" />
            </div>
            <div className="rosterGrid">
                {team.members.map(name => (
                    <MemberCard key={name} name={name} image={team.images?.[name]} />
                ))}
            </div>
        </div>
    );
}

function MemberCard({ name, image }) {
    const src = image ?? placeholder;
    return (
        <div className="rosterMember">
            <div
                className={`rosterPortrait ${image ? "hasPhoto" : "noPhoto"}`}
                role="img"
                aria-label={name}
                style={{ backgroundImage: `url(${src})` }}
            />
            <p className="rosterName">{name}</p>
        </div>
    );
}
