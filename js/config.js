// =====================================================================
//  XANDER TEAM DASHBOARD: edit this file to add or change members.
// =====================================================================
const TEAM = {
  name: "Xander",
  fullName: "Xander Development Society",
  tagline: "A team of Tech Broz building software together. Meet the developers, then open their portfolios.",
  github: "Xander-Land",            // the team's GitHub account
  openInNewTab: true,               // open a member's portfolio in a new tab
  refreshMinutes: 5,                // how often live data is re-checked
  effects: {
    pulse: true,           // heartbeat pulse orbiting every profile photo, code streaming out of it
    pulseRadius: 56,       // how far the orbit sits from the photo's centre (46 to 66; the photo itself is 40)
    codeRain: true,        // falling code in the background
    codeFlow: true,        // typed code flowing across the page background (replaces the terminal window)
    hacker: true,          // hooded ethical hacker picture in the background (bottom right)
    hackerImage: "images/hacker.webp",   // swap this file or path to change the picture
    sound: true,           // background music button (starts off, visitors switch it on)
    soundVolume: 0.5       // 0 to 1
  },

  join: {
    text: "Part of Xander and not listed yet? Send your portfolio link and GitHub username to the team and we will add your card.",
    url: "https://github.com/Xander-Land"
  },

  // One block per member. Leave name, role or bio as "" to use the GitHub profile instead.
  //   portfolio: the member's portfolio address (opens when the card is clicked)
  //   github:    GitHub username (gives live repos, followers and latest update)
  //   photo:     picture address or file in images/members/ (falls back to the GitHub photo)
  //   tags:      skills used for the filter buttons
  //   links:     extra public links, e.g. { LinkedIn: "https://..." }
  members: [
    {
      name: "Simor Uphills",
      role: "Software Engineer · Web Developer · Cyber Security",
      bio: "Computer scientist building secure, data-driven web products. Also creates gospel and motivational music with HillsNation.",
      tags: ["Web", "Security", "Data & AI", "Music"],
      portfolio: "https://simodaurbanwiz-jpg.github.io",
      github: "simodaurbanwiz-jpg",
      photo: "images/members/simor.jpg",
      links: { LinkedIn: "https://www.linkedin.com/in/simoruphills-ug-046406442", X: "https://x.com/simoruphills" }
    },
    {
      name: "Praise Assumptah",
      role: "Backend Developer · Cyber Security Student",
      bio: "Computer Science student who writes Python and Java, designs MySQL databases and trains in ethical hacking.",
      tags: ["Backend", "Security"],
      portfolio: "https://praise-assumptah.github.io/PORTFOLIO/",
      github: "Praise-Assumptah",
      photo: "https://praise-assumptah.github.io/PORTFOLIO/uploads/profile.jpg",
      links: {}
    },
    {
      name: "SCIRE",
      role: "Junior Web Developer",
      bio: "Computer Science student building clean, accessible and responsive web experiences. Currently learning React and Node.js.",
      tags: ["Frontend", "Web"],
      portfolio: "https://scire-portfolio.vercel.app/",
      github: "yorekadeve",
      photo: "https://scire-portfolio.vercel.app/assets/images/profile/me.png",
      links: { LinkedIn: "https://linkedin.com/in/yoreka-albert", TikTok: "https://tiktok.com/@scire.cs" }
    },
    {
      name: "",   // filled from GitHub until you add it
      role: "",
      bio: "",
      tags: ["Developer"],
      portfolio: "https://mahdi27tech.github.io/portfolio/",
      github: "mahdi27tech",
      photo: "",
      links: {}
    },
    {
      name: "Agondeze Joshua Samuel",
      role: "Computer Scientist · Web Developer",
      bio: "Computer Scientist in Mbarara who builds clear, simple websites. Learning Java and database programming, and passionate about robotics.",
      tags: ["Web", "Robotics"],
      portfolio: "https://agondezejoshuasamuel-opsops.github.io/Portfolio-website/",
      github: "agondezejoshuasamuel-opsOPS",
      photo: "https://agondezejoshuasamuel-opsops.github.io/Portfolio-website/assets/images/profiledm.png",
      links: { LinkedIn: "https://www.linkedin.com/in/agondeze-joshua-samuel-907b0837a/", TikTok: "https://tiktok.com/@joshua_sam_tech", Instagram: "https://www.instagram.com/agondezejoshua" }
    }
  ]
};
