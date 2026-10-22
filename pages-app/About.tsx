import {siteVersion} from './release';
export default function About(){
 return <section id="settings-About" className="settings-about about-minimal about-classic" aria-label="About"><h3>FEH Rerun Schedule by Clustifle</h3><p>Version {siteVersion}</p><p>Made by Clustifle</p><hr/><p>Artwork © Nintendo / INTELLIGENT SYSTEMS</p><p>This is an unofficial fan project, unaffiliated with Nintendo or INTELLIGENT SYSTEMS.</p><p>Special thanks to u/King41bert0713 for features idea and feedback.</p></section>;
}
