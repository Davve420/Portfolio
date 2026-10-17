import fashionSpiritPortal from '../assets/fashion-spirit-portal.gif'
import cvPdf from '../assets/CV.pdf'
import cvPreview from '../assets/previewCV-png.png'

export const siteContent = {
  brand: 'Davi.n3t',
  space: {
    intro: 'Welcome to Davin3t. This is my little part of the vast network we call the internet. In the digital realm we can create freely and express ourselves without the confines of social media. This is me on display in the boutique window for everyone to watch. This is me on stage where I direct the play. Now I encourage you to explore my digital world while also exploring your own innerworld.',
    portals: [
      {
        id: 'music',
        title: 'Digital shrine',
        summary: 'A room filled with the sounds I love, the people who inspire me, my interests and dearest distractions. What makes me, me? Why do I like the things I like? ',
        image: '/assets/portals/digiportal.gif',
      },
      {
        id: 'about',
        title: 'Work and Collaboration',
        summary: 'The central space for work, projects, creative direction, and who I am professionally.',
        image: '/assets/portals/n3tportal.gif',
      },
      {
        id: 'fashion',
        title: 'Expression',
        summary: 'A place where all my expression is dispayed and up for interpretation. What did Davi feel here? Why did they post that? Why do they dress like that? ',
        image: fashionSpiritPortal,
      },
    ],
  },
  hero: {
    eyebrow: 'A personal digital space',
    title: 'Source consciousness, expressed through code.',
    description: 'I build thoughtful digital spaces for reflection, creativity, and meaningful connection.',
  },
  values: ['Creative technology', 'Spirituality', 'Community', 'Human-centered design'],
  projects: [
    { title: 'Gathering Garden', number: '01', description: 'A digital garden for gathering ideas, people, and small moments of wonder.', image: '/assets/projects/gathering-garden.jpg', href: 'https://kingtutz.github.io/gritsquare-grupp1-fe25/', github: 'https://github.com/Kingtutz/gritsquare-grupp1-fe25', type: 'Group project / styling and features' },
    { title: 'Reading List', number: '02', description: 'A thoughtful little interface for keeping the things I want to return to.', image: '/assets/projects/reading-list.jpg', href: 'https://davireads.netlify.app/', github: 'https://github.com/Davve420/fe25-js2-laslista-david-brolin', type: 'Interactive app / realtime database' },
    { title: 'MovieFinder', number: '03', description: 'A playful search experience where finding a story feels like opening a portal.', image: '/assets/projects/movie-finder.jpg', href: 'https://davve420.github.io/fe25-js-slutuppgift-david-brolin/', github: 'https://github.com/davve420/fe25-js-slutuppgift-david-brolin', type: 'JavaScript app / API integration' },
    { title: 'Solar Punk', number: '04', description: 'A hopeful visual world for imagining more sustainable futures.', image: '/assets/projects/solar-city.jpg', href: '/legacy/solarpunk.html', type: 'Ongoing visual world' },
    { title: 'FungiDiet', number: '05', description: 'A prototype web shop for a personal brand with a strange, black metal charm.', image: '/assets/projects/fungi-diet.png', href: 'https://fungidiet.netlify.app/', github: 'https://github.com/Davve420/Fungi.Diet', type: 'Prototype webshop' },
    { title: "Hornet's Silk & Songs", number: '06', description: 'A design-forward game fan page made as a visual experiment.', image: '/assets/projects/hornets-silk-songs.png', href: 'https://hornetsilksong.netlify.app/', github: 'https://github.com/Davve420/Hornet-HTMLdesign', type: 'Creative design page' },
    { title: 'PlushieWorld', number: '07', description: 'A playful React shopping demo with a soft, collectible world.', image: '/assets/projects/plushie-world.png', href: 'https://plushieworld.netlify.app/', github: 'https://github.com/Davve420/PlushieWorldClient', type: 'React shopping demo' },
    { title: 'Hangman', number: '08', description: 'A small browser game and an early exercise in interaction design.', image: '/assets/projects/hangman.jpg', href: '/legacy/hangman/index.html', type: 'Browser mini game' },
    { title: 'Time Capsule', number: '09', description: 'An archive from my first web era, kept as part of the journey.', image: '/assets/projects/time-capsule.jpg', href: '/legacy/FirstPage/index.html', type: 'First web era archive' },
    
  ],
  about: {
    eyebrow: 'The person behind the pixels',
    title: 'I build because I want the digital world to feel more human.',
    intro: 'I am Daviden(Davi for short) — a software developer, creative thinker, spiritual guide and digital community builder. I am passionate about tech, aesthetics, spirituality, and creating spaces where like-minded people can connect. On this page, you will find what I do, what I am working toward, and how to reach out.',
    story: [
      'I did not get into tech just to ship features. I started building because I wanted to understand myself, create meaningful things, and help people feel less alone in a noisy digital world.',
      'Self-awareness, self-love, innovation and conscious creation shape my work. I care about how a product feels, whether it creates clarity instead of stress, and whether there is still room for curiosity.',
      'I bring both structure and soul: clean implementation, curiosity, and strong collaboration. I like turning ideas into practical experiences without losing the human side.',
    ],
    quote: 'Straight up source consciousness manifesting through my human experience.',
    identity: [
      {
        title: 'Why I Started',
        text: 'I did not get into tech just to ship features. I started building because I wanted to understand myself, expand and innovate ideas, create meaningful things, and help people feel less alone in a noisy digital world.',
      },
      {
        title: 'What Shapes My Work',
        text: 'Self-awareness, self-love, and conscious creation are my foundation. I care about how a product feels, how it supports people, and whether it creates clarity instead of stress.',
      },
      {
        title: 'What You Can Expect From Me',
        text: 'I bring both structure and soul: clean implementation, curiosity, and strong collaboration. I like turning ideas into practical experiences without losing the human side.',
      },
    ],
    buildAreas: [
      { title: 'Web Development', text: 'Interactive JavaScript and React projects that turn ideas into useful, human-centered digital experiences.' },
      { title: 'Creative Design', text: 'Interfaces where aesthetics and functionality work together, often with a little atmosphere and personality.' },
      { title: 'Community & Values', text: 'Digital spaces that help people connect around creativity, spirituality, technology, and sustainability.' },
    ],
    opportunities: [
      { title: 'LIA / Internship', text: 'I am looking for a LIA placement where I can learn, contribute, and grow in a professional development team.', tag: 'Professional' },
      { title: 'Creative Collaborations', text: 'I am open to working with creators, designers, and spiritual practitioners to build something meaningful together.', tag: 'Creative' },
      { title: 'Community Connections', text: 'If you are interested in tech, spirituality, sustainability, or digital aesthetics, let us connect.', tag: 'Community' },
    ],
    reflection: 'I am interested in the questions that live underneath everyday life: why we think the way we do, how our values shape our choices, and how we can become more present in the worlds we build.',
  },
  soundtrack: {
    label: 'Current soundtrack',
    title: 'Soft focus, late-night builds, warm synths, and cosmic drift.',
    description: 'Music is part of my creative environment. It helps me think, design, and build spaces that feel alive.',
    mood: 'Dreamy electronica / ambient / melodic house',
    link: 'https://open.spotify.com/',
  },
  socials: [
    { label: 'Instagram', mark: 'ig', href: 'https://www.instagram.com/dav1den/' },
    { label: 'TikTok', mark: 'tk', href: 'https://www.tiktok.com/@davin3t' },
    { label: 'Email', mark: '@', href: 'mailto:davidbrolin04@gmail.com' },
  ],
  credentials: [
    { title: 'My CV', image: cvPreview, href: cvPdf },
    { title: 'AI Certificate', image: '/assets/ai-certificate.png', href: '/assets/ai-certificate.png' },
  ],
}
