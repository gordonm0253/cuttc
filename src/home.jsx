import "react";
//import nats2024 from './assets/nats2024.jpg';
import div2024 from './assets/fa2024div.jpg';
import nathan from './assets/gallery1.jpg'; 

export default function Home() {
    return (
        <>
            <div className = "headingDiv loadingAnimate">
                <img src = {nathan} className = "headingImage"></img>
                <div className = "headingTitleDiv">
                    <h1 className = "headingTitle">Cornell Table Tennis</h1>
                </div>
            
            </div>
            <div className = "welcomeDiv loadingAnimate">
                <h1>
                    Welcome!
                </h1>
                <p>
                    Cornell Table Tennis Club is a registered student organization of Cornell University. 
                    We invite players of all skill levels to our practices to have fun and improve their skills. 
                    Our club teams also compete in NCTTA (National Collegiate Table Tennis Association) regional and 
                    national tournaments each year.
                </p>
                <p>
                    The club meets each week for open practice. Sign up on CampusGroups and join us from 1-3 PM on Saturdays at Appel Commons!
                    Check the About Us page for more information on practices.
                </p>
            </div>
            <div className = "recentDiv loadingAnimate">
                <h2>
                    Recent News
                </h2>
                <p>On November 2nd, the A, B, and women’s teams traveled to Elevate Fitness in Syracuse to compete in the NCTTA Upstate NY fall divisionals (West NY division). All 3 teams went undefeated in their matches, facing teams from RIT, SUNY Buffalo, etc. Our next tournament will be the spring divisionals, where we will also send our A, B, and women’s teams.</p>
                <ul>
                    <li>Cornell A: def. SUNY Buffalo A (4-0), def. RIT A (4-0), def. Rochester A (4-0)</li>
                    <li>Cornell B: def. SUNY Buffalo B (3-1), def. RIT B (3-1), def. Binghamton W (4-0)</li>
                    <li>Cornell Women: def. Rochester W (4-0), def. RIT B (3-1), def. Binghamton W (4-0)</li>
                </ul>
                <div className= "recentImageDiv">
                    <img src = {div2024} />
                </div>
                <p className = "homeGalleryText">
                    Check out our Gallery for more tournament pictures!
                </p>
            </div>
        </>
    );
}
