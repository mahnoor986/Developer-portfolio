/**
 * The site's starting content, shared by `src/seed.ts` (fills an empty database) and
 * `src/scripts/applyClientFacing.ts` (updates an existing one).
 *
 * The first version was copied from legacy/index.html. The client-facing version (Nov 2026)
 * rewrites it for clients: services, client projects first, no games, no source-code links.
 * After seeding, everything is edited in the Payload admin, not here.
 */

export const images = {
  avatar: {
    file: 'legacy/assets/images/main-character/avatar.png',
    alt: 'Illustrated avatar of Mahnoor Siddiqui in a black hijab and pink glasses, arms crossed',
  },
  khairflow: {
    file: 'seed-assets/khairflow.png',
    alt: 'Screenshot of the KhairFlow website hero: the KhairFlow logo over flowing light lines',
  },
  ait: {
    file: 'seed-assets/ait.webp',
    alt: 'Screenshot of the AIT website hero: "Build Skills. Build Your Future." with photos of students in class',
  },
  voltra: { file: 'legacy/assets/images/projects/voltra.png', alt: 'Screenshot of the VOLTRA Showreel website' },
  rado: { file: 'legacy/assets/images/projects/rado-builders.png', alt: 'Screenshot of the Rado Builders website' },
} as const

export type ImageKey = keyof typeof images

type Link = { label: string; url: string }
export type ProjectSeed = {
  title: string
  category: string
  year: string
  description: string
  tags: string[]
  image?: ImageKey
  imagePosition: 'center' | 'center top' | 'center bottom' | 'left center' | 'right center'
  primaryLink?: Link
}

/** In display order. */
export const projects: ProjectSeed[] = [
  {
    title: 'KhairFlow',
    category: 'Company website',
    year: '2026',
    description:
      'The company website for KhairFlow, a software house that builds AI automation, SaaS, DevOps and full-stack systems for schools, hospitals, NGOs and businesses across Pakistan and the Gulf. As the main frontend developer in a small team, I built most of the site: the animated hero, the services section, an interactive tour of their eight business modules, the product pages, the selected-work showcase, the process section and a project-brief form that turns visitors into sales calls, with smooth scroll and motion throughout.',
    tags: ['Next.js', 'TypeScript', 'GSAP', 'Three.js'],
    image: 'khairflow',
    imagePosition: 'center',
    primaryLink: { label: 'View live', url: 'https://khairflow.com/' },
  },
  {
    title: 'Rado Builders',
    category: 'Client website',
    year: '2026',
    description:
      'A real-estate company with two brands needed one website that presented both clearly. I designed and built a split-screen entry that sends visitors to the right brand, project listings with detail pages, an interactive 3D globe and maps, and smooth animations that make the site feel premium. Built at Alkhair Innovative Tech Solutions.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    image: 'rado',
    imagePosition: 'center',
  },
  {
    title: 'AIT',
    category: 'Education website',
    year: '2026',
    description:
      'The website for Al-Khair Institute of Technology, a Karachi tech institute that has trained 5,000+ students, built to turn visitors into applicants. Working in a small team, I moved the site to Next.js and built the course catalogue cards, the animated impact counters, and the "Explore our courses" and "How to register" pages that guide students from browsing to applying.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    image: 'ait',
    imagePosition: 'left center',
    primaryLink: { label: 'View live', url: 'https://ait.iak.ngo/' },
  },
  {
    title: 'VOLTRA Showreel',
    category: 'Concept website',
    year: '2026',
    description:
      'A concept site for an electric-bike brand, showing what a premium, motion-led website can do for a product launch: a cinematic hero, a 3D energy core, an AI ride assistant that plots routes, an exploded bike view and scroll-driven storytelling. A good reference if you want your brand to stand out instead of looking like a template.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Express'],
    image: 'voltra',
    imagePosition: 'center top',
    primaryLink: { label: 'View live', url: 'https://voltramp4.vercel.app' },
  },
]

/** Projects from the first version that are no longer shown (kept as drafts, not deleted). */
export const retiredProjects = ['The Ashen Monastery', 'Raycast Maze']

export const skills: [name: string, category: 'fe' | 'be' | 'tl', blurb: string][] = [
  ['HTML5', 'fe', 'Semantic, accessible markup'],
  ['CSS3', 'fe', 'Layouts, grids and motion'],
  ['JavaScript', 'fe', 'ES6+, the DOM, async'],
  ['TypeScript', 'fe', 'Safer, scalable code'],
  ['React', 'fe', 'Components, hooks, state'],
  ['Next.js', 'fe', 'Routing, SSR, performance'],
  ['Tailwind CSS', 'fe', 'Fast, consistent styling'],
  ['Bootstrap', 'fe', 'Responsive layouts, quickly'],
  ['Vite', 'fe', 'Fast builds and dev server'],
  ['Responsive UI', 'fe', 'Every screen size'],
  ['Node.js', 'be', 'Server-side JavaScript'],
  ['Express', 'be', 'APIs and middleware'],
  ['Django', 'be', 'Python web backends'],
  ['REST APIs', 'be', 'Clean, documented endpoints'],
  ['PostgreSQL', 'be', 'Relational data and SQL'],
  ['MySQL', 'be', 'Relational databases'],
  ['MongoDB', 'be', 'Flexible document data'],
  ['C / C++', 'be', 'Algorithms and game engines'],
  ['Git', 'tl', 'Version control, branching'],
  ['GitHub', 'tl', 'Repos, releases, Pages'],
  ['Docker', 'tl', 'Containerised workflows'],
  ['Figma', 'tl', 'Designing and building UIs'],
  ['Stitch', 'tl', 'AI-assisted UI design'],
  ['VS Code', 'tl', 'My daily editor'],
  ['Vercel', 'tl', 'Fast deploys and previews'],
  ['raylib', 'tl', 'Games and graphics in C'],
]

export const processSteps = [
  {
    title: 'Understand',
    description:
      'A free call about your business, your customers and what the website needs to achieve. You get a clear quote and timeline before any work starts.',
    tags: ['Discovery call', 'Requirements', 'User flows'],
  },
  {
    title: 'Plan & design',
    description: 'I show you the layout and design first, so you can approve the look before I build anything.',
    tags: ['Wireframes', 'System design', 'Tech stack'],
  },
  {
    title: 'Build',
    description:
      'I build your site in small steps and share a preview link every week, so you see progress and give feedback early.',
    tags: ['Frontend', 'Backend', 'APIs'],
  },
  {
    title: 'Test & polish',
    description: 'I test on phones, tablets and desktops, speed it up and fix the small details before launch.',
    tags: ['QA', 'Performance', 'Accessibility'],
  },
  {
    title: 'Launch & grow',
    description:
      'I put your site live, connect your domain, show you how to edit it, and stay available for updates and support.',
    tags: ['Deployment', 'Monitoring', 'Support'],
  },
]

export const experience = [
  {
    title: 'Junior Developer',
    period: 'Nov 2026 to now',
    organization: 'KhairFlow, Karachi',
    description:
      'Collaborating with the development team to build and maintain real-world web applications, following modern development practices, AI-assisted workflows, and code review standards.',
  },
  {
    title: 'Intern Developer',
    period: 'Aug 2026 to Oct 2026',
    organization: 'KhairFlow, Karachi',
    description:
      'Working with the engineering team on real web products, following an AI-native development workflow with code reviews and a clear definition of done.',
  },
]

/** Contact form options, in display order. */
export const contactOptions = ['New website', 'Website redesign', 'Web app / dashboard', 'Care & updates', 'Something else']

/** Old contact option label → current label, for databases seeded with the first version. */
export const renamedContactOptions: Record<string, string> = {
  Website: 'New website',
  'Web app': 'Website redesign',
  'Mobile app': 'Web app / dashboard',
  'Full-time role': 'Care & updates',
}

/** In display order. `ask` is the contact option the "Ask about this" link selects. */
export const services = [
  {
    title: 'New business website',
    problem: "You have no website, or just a social page, and customers can't find or trust you.",
    outcome:
      'A professional, responsive site with your services, contact form, Google-ready SEO and an admin panel to edit it yourself.',
    ask: 'New website',
  },
  {
    title: 'Website redesign',
    problem: 'Your site looks outdated, is slow, or breaks on phones, and visitors leave.',
    outcome: 'A modern redesign that keeps your content and domain, loads fast and looks great on every screen.',
    ask: 'Website redesign',
  },
  {
    title: 'Web app & admin dashboard',
    problem: 'You run your business on spreadsheets, paper or WhatsApp, and data gets lost or messy.',
    outcome:
      'A custom web app with a database and an admin dashboard: manage records, users, bookings or listings from one place.',
    ask: 'Web app / dashboard',
  },
  {
    title: 'Care & updates',
    problem: 'Your site is live, but you need small changes and have no developer.',
    outcome:
      'Text and image changes, fixes, security updates and backups after launch, as a monthly plan or per request.',
    ask: 'Care & updates',
  },
]

/** Minimal Lexical document: paragraphs made of plain and bold pieces. */
export const richText = (...paragraphs: (string | { bold: string })[][]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: paragraphs.map((pieces) => ({
      type: 'paragraph',
      version: 1,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      textFormat: 0,
      textStyle: '',
      children: pieces.map((p) => ({
        type: 'text',
        version: 1,
        detail: 0,
        mode: 'normal',
        style: '',
        format: typeof p === 'string' ? 0 : 1, // 1 = bold
        text: typeof p === 'string' ? p : p.bold,
      })),
    })),
  },
})

/**
 * Site settings texts that the client-facing version changes. `applyClientFacing` writes exactly
 * these; the seed writes them together with `siteSettingsBase`.
 */
export const clientFacingSettings = {
  metaTitle: 'Mahnoor Siddiqui — Websites, Redesigns & Web Apps',
  metaDescription:
    'I design and build fast, responsive websites, redesign outdated ones, and build web apps with admin dashboards so you can manage your own content and data. Based in Karachi, working worldwide.',
  availabilityText: 'Taking new client projects',
  // Hero
  intro: 'I design and build websites that make your business look as good as it really is.',
  introMuted:
    'New websites, redesigns and web apps with admin dashboards: fast, responsive on every screen, and easy for you to manage yourself.',
  heroLabel: 'Mahnoor, full-stack developer',
  tagline: '[ websites · redesigns · web apps ]',
  marquee: ['New websites', 'Redesigns', 'Web apps', 'Admin dashboards', 'Responsive', 'SEO-ready'].map((word) => ({
    word,
  })),
  // About (the manifesto is removed: an empty field hides it)
  manifesto: '',
  aboutText: richText(
    [
      'I’m ',
      { bold: 'Mahnoor Siddiqui' },
      ', a full-stack web developer from Karachi. I build responsive websites for businesses that want to look professional online and turn visitors into customers, I redesign outdated websites so they look modern and work on every screen, and I build web apps with admin dashboards so you can manage your content and data yourself.',
    ],
    [
      'I handle the whole project, from design and frontend to backend, database and launch, so you deal with one person who knows your project inside out. Every site I build is fast, works on every phone, and comes with an admin panel so you can change text, images and listings without calling a developer.',
    ],
    [
      'I also work as a Junior Developer at KhairFlow, where I follow a professional workflow with code reviews and testing, and I bring the same standards to every client project.',
    ],
  ),
  facts: [
    { value: '4', label: 'Websites launched' },
    { value: '24h', label: 'Reply time' },
    { value: '100%', label: 'Responsive builds' },
  ],
  // Services
  servicesKicker: 'What I do',
  servicesHeading: { lead: 'Services', accent: 'that grow your business' },
  servicesIntro:
    "Whether you're starting from scratch or your current site isn't working for you, here's how I can help.",
  servicesProblemLabel: 'The problem',
  servicesOutcomeLabel: 'What you get',
  servicesAskLabel: 'Ask about this',
  servicesNote: 'Most business websites are live in 2–3 weeks. Every quote is free and agreed before work begins.',
  // Why work with me
  whyKicker: 'Why work with me',
  whyHeading: { lead: 'Why', accent: 'clients pick me' },
  whyItems: [
    {
      title: 'One person, start to finish.',
      text: 'Frontend, backend and database: no hand-offs, no lost messages.',
    },
    { title: 'You see progress every week.', text: 'Preview links, not surprises.' },
    { title: 'You own and control it.', text: 'Manage your own content and data from a simple admin panel.' },
    { title: 'Fast and responsive.', text: 'Built to load quickly and look right on any phone.' },
    { title: 'Support after launch.', text: "I don't disappear once the site is live." },
  ],
  // Sections
  workIntro:
    'Real websites for real businesses. Each one started with a business problem and ended with a site the owner is proud to share.',
  toolkitTitle: 'Modern tools, so your site is fast and future-proof.',
  toolkitText:
    "You don't need to know any of these. They're why your site loads quickly, ranks well on Google and stays easy to update for years.",
  processIntro:
    "A clear, step-by-step process, so you always know what's happening, what's next and when your site goes live.",
  experienceIntro: "Where I've worked and what I've built.",
  // Contact
  contactKicker: 'Start a project',
  contactHeading: { lead: "Need a new website?\nLet's", accent: 'build it.' },
  contactSubtext:
    "Tell me about your business and what you need: a new website, a redesign of your current one, or a web app with a dashboard. I'll reply with questions, a rough timeline and a free quote — no obligation.",
  optionsLabel: 'What do you need?',
  messageLabel: 'Tell me about your business and what you want to build',
  sendLabel: 'Get my free quote',
  formNote: 'I reply within 24 hours.',
  successMessage: "Thanks! I've got your message and will reply within 24 hours with next steps.",
  location: 'Based in Karachi, Pakistan. Working with clients worldwide, remotely.',
  ctaLabel: 'Get a quote',
}

/** Site settings that only the seed writes (unchanged by the client-facing version). */
export const siteSettingsBase = {
  name: 'Mahnoor',
  fullName: 'Mahnoor Siddiqui',
  defaultVibe: 'violet' as const,
  available: true,
  year: '2026',
  aboutKicker: 'About me',
  photoTagName: 'Mahnoor',
  photoTagRole: 'developer',
  workHeading: { lead: 'Selected', accent: 'work' },
  toolkitHeading: { lead: 'My', accent: 'toolkit' },
  toolkitOverviewTab: 'Overview',
  frontend: {
    tabLabel: 'Frontend',
    title: 'Frontend',
    countWord: 'skills',
    text: 'Responsive, accessible interfaces with smooth motion and solid component architecture.',
    cardText: 'Interfaces that feel fast and look sharp',
  },
  backend: {
    tabLabel: 'Backend',
    title: 'Backend',
    countWord: 'skills',
    text: 'Server logic, data modelling and APIs in Node.js and Django, plus lower-level work in C and C++.',
    cardText: 'APIs and databases that hold up',
  },
  tools: {
    tabLabel: 'Tools',
    title: 'Tools & workflow',
    countWord: 'tools',
    text: 'The tools that keep my work versioned, tested and deployed without drama.',
    cardText: 'The workflow behind clean releases',
  },
  exploringLabel: 'Currently exploring',
  exploring: ['AI integration', 'Docker', '3D graphics'].map((item) => ({ item })),
  processKicker: 'How I build',
  processHeading: { lead: 'From idea\nto', accent: 'launch' },
  experienceHeading: { lead: 'My', accent: 'experience' },
  nameLabel: 'Your name',
  emailLabel: 'Your email',
  errorMessage: 'Add your name, a valid email and a short message, then send again.',
  emailCardTitle: 'Email',
  copyEmailLabel: 'Copy email',
  copiedLabel: 'Copied',
  socialsTitle: 'Find me online',
  email: 'mahnoorrr41@gmail.com',
  githubUrl: 'https://github.com/mahnoor986',
  linkedinUrl: 'https://www.linkedin.com/in/mahnoor-siddiqui-tech/',
  footerText: '© {year} Mahnoor Siddiqui. Designed and built with care.',
  // CV (no PDF yet: the button stays hidden until one is uploaded)
  cvLabel: 'Download CV',
}
