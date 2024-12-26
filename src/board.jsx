import React from "react";
import malong from "./assets/malong.jpeg";

export default function Board() {
    return (
        <>
            <h1>2024-2025 E-Board</h1>
            <Profile 
                name = "Ma Long"
                position = "Grandmaster"
                netid = "ml2239"
                image = {malong}
                major = {["Computer Science"]}
                year = "25"
                
            />
        </>
        
    );
}



function Profile({info}) {
    return (
        <div>

        </div>
    );
}