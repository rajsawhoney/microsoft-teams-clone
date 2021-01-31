import React from "react";
import { Facebook, Twitter, LinkedIn, GitHub, Work } from "@material-ui/icons";
import "./Home.css";
import { Bubbles } from "../components/Loader";

const Welcome = ({ about }) => {
  if (about) {
    return (
      <div className="side__stuffs">
        <h2>What is Microsoft Teams?</h2>
        <p>
          Microsoft Teams is a persistent chat-based collaboration platform
          complete with document sharing, online meetings, and many more
          extremely useful features for business communications.
        </p>
        <p>
          Having an excellent team space is key to being able to make creative
          decisions and communicate with one another. Shared workspace software
          makes this much easier to achieve, especially if a particular team is
          based in a very large company, has many remote employees, or is made
          up of a significant amount of team members.
        </p>
        <p>
          Microsoft Teams has many core components that make it stand out from
          other collaboration software:
        </p>

        <ul>
          <li>
            <strong>Teams and channels.</strong> Teams are made up of channels,
            which are conversation boards between teammates.
          </li>
          <li>
            <strong>Conversations within channels and teams.</strong> All team
            members can view and add to different conversations in the General
            channel and can use an @ function to invite other members to
            different conversations, not unlike Slack.
          </li>
          <li>
            <strong>A chat function.</strong> The basic chat function is
            commonly found within most collaboration apps and can take place
            between teams, groups, and individuals.
          </li>
          <li>
            <strong>Document storage in SharePoint.</strong> Every team who uses
            Microsoft Teams will have a site in SharePoint Online, which will
            contain a default document library folder. All files shared across
            all conversations will automatically save to this folder.
            Permissions and security options can also be customized for
            sensitive information.
          </li>
          <li>
            <strong>Online video calling and screen sharing.</strong> Enjoy
            seamless and fast video calls to employees within your business or
            clients outside your business. A good video call feature is great to
            have on a collaboration platform. One can also enjoy simple and fast
            desktop sharing for technical assistance and multi-user real-time
            collaboration.
          </li>
          <li>
            <strong>Online meetings.</strong> This feature can help enhance your
            communications, company-wide meetings, and even training with an
            online meetings function that can host up to 10,000 users. Online
            meetings can include anyone outside or inside a business. This
            feature also includes a scheduling aid, a note-taking app, file
            uploading, and in-meeting chat messaging.
          </li>
          <li>
            <strong>Audio conferencing.</strong> This is a feature you won’t
            find in many collaboration platforms. With audio conferencing,
            anyone can join an online meeting via phone. With a dial-in number
            that spans hundreds of cities, even users that are on the go can
            participate with no internet required. Note this requires additional
            licensing.
          </li>
          <li>
            <strong>Full telephony.</strong> That’s right! The days of seeking
            VoIP vendors and overspending on a phone system are finally over.
            Microsoft Teams can completely replace your business’ existing phone
            system. Note this requires additional licensing.
          </li>
        </ul>

        <h2>Why Should Your Business Use Microsoft Teams?</h2>
        <p>
          When it comes down to it, businesses should use Microsoft Teams
          because it is extremely user-friendly and can facilitate a work
          environment between remote users or within a large business. Projects,
          productions, and other business elements can benefit from Microsoft
          Teams.
        </p>

        <p>
          For businesses already using Skype for Business, the Teams client will
          replace the Skype client, but all additional existing functionality
          will remain the same.
        </p>

        <h2>Using Microsoft Teams</h2>
        <p>
          Teams is incredibly straightforward and user-friendly. There is little
          to no set up required. Still, some thought should be put into how a
          business wants to use the platform before rolling it out across the
          company.
        </p>
        <Bubbles />
      </div>
    );
  }
  return (
    <div className="home__container">
      <h2>Welcome To Our Microsoft Teams Clone Web App</h2>
      <p>
        This app is developed from the scratch during the learning phase of
        React Js
      </p>
      <p>
        After developing this clone web app, I felt, like its very easy to clone
        any modern web app available in the market using React JS and that too
        with super fast speed.
      </p>
      <div className="short__info">
        <p>
          This app is still in development phase.
          <br /> However, the chat section is completed and works fine.
          <br />
          Currently, I'm working on Audio and Video Call Feature. Till then
          enjoy chatting with your loved ones.
          <br />
          See you soon with other cool features.
        </p>
      </div>

      <div className="footer">
        <p>
          If you have any queries related to this web app, you can contact me
          through the social links below:
        </p>
        <ul>
          <li>
            <a href="https://github.com/rajsawhoney" target="new">
              <GitHub /> <p>GitHub</p>
            </a>
          </li>

          <li>
            <a
              href="https://www.linkedin.com/in/razz-sawhoney-2b1a05190/"
              target="new"
            >
              <LinkedIn /> <p>LinkedIn</p>
            </a>
          </li>

          <li>
            <a href="https://twitter.com/rajsahani1819" target="new">
              <Twitter /> <p>Twitter</p>
            </a>
          </li>

          <li>
            <a href="https://www.facebook.com/razzsawhoney/" target="new">
              <Facebook /> <p>FaceBook</p>
            </a>
          </li>
        </ul>
        <a
        className="hire-me-sec"
        href="https://www.fiverr.com/share/L43DD7"
          target="new"
        >
          <Work /> <p>Wanna Hire Me???</p>
        </a>
      </div>
    </div>
  );
};
export default Welcome;
