/**
 * Fills Payload with the content of the original static site (legacy/index.html).
 * Run with: npx payload run src/seed.ts
 *
 * Safe to re-run: documents that already exist (matched by title/name/label/filename)
 * are skipped, and Site settings are only filled when they are still empty.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload, type Payload } from 'payload'

import config from './payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const legacyAssets = path.resolve(dirname, '../legacy/assets/images')

// ---------------------------------------------------------------------------
// Content, copied from legacy/index.html
// ---------------------------------------------------------------------------

const images = {
  avatar: {
    file: 'main-character/avatar.png',
    alt: 'Illustrated avatar of Mahnoor Siddiqui in a black hijab and pink glasses, arms crossed',
  },
  ashen: { file: 'projects/ashen-monastery.png', alt: 'Screenshot of The Ashen Monastery game' },
  voltra: { file: 'projects/voltra.png', alt: 'Screenshot of the VOLTRA Showreel website' },
  maze: { file: 'projects/raycast-maze.png', alt: 'Screenshot of the Raycast Maze game' },
  rado: { file: 'projects/rado-builders.png', alt: 'Screenshot of the Rado Builders website' },
}

const projects = [
  {
    title: 'The Ashen Monastery',
    category: '3D game',
    year: '2026',
    description:
      'A third-person, PS1-style gothic horror game I wrote from scratch in C99 with raylib, built as a college project. Five wings of a castle, relics to destroy and two boss fights, with low-poly architecture, custom GLSL shaders, fog and candlelight.',
    tags: ['C99', 'raylib', 'GLSL'],
    image: 'ashen',
    imagePosition: 'center',
    primaryLink: { label: 'Download game', url: 'https://github.com/mahnoor986/The-Ashen-Monastery/releases/latest' },
    secondaryLink: { label: 'Source code', url: 'https://github.com/mahnoor986/The-Ashen-Monastery' },
  },
  {
    title: 'VOLTRA Showreel',
    category: 'Concept website',
    year: '2026',
    description:
      'A cinematic concept site for an electric-bike brand, built to show what a premium, motion-heavy website can feel like. A letterboxed hero with a camera HUD, a 3D energy core, an AI ride assistant that streams answers and plots a route, an exploded bike view, a rotating 3D carousel and scroll-driven reveals, mostly in pure CSS.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Express'],
    image: 'voltra',
    imagePosition: 'center top',
    primaryLink: { label: 'View live', url: 'https://voltramp4.vercel.app' },
    secondaryLink: { label: 'Source code', url: 'https://github.com/mahnoor986/voltra-cinematic-showreel' },
  },
  {
    title: 'Raycast Maze',
    category: 'Game',
    year: '2026',
    description:
      'A first-person 3D maze with no 3D engine: the view is computed from a 2D grid using DDA raycasting, the technique behind Wolfenstein 3D. Every run generates a new maze with a recursive backtracker, and BFS places the exit at the farthest cell.',
    tags: ['C', 'raylib', 'Algorithms'],
    image: 'maze',
    imagePosition: 'center',
    primaryLink: {
      label: 'Download game',
      url: 'https://github.com/mahnoor986/The-Raycasting-3D-Maze-Game/releases/latest',
    },
    secondaryLink: { label: 'Source code', url: 'https://github.com/mahnoor986/The-Raycasting-3D-Maze-Game' },
  },
  {
    title: 'Rado Builders',
    category: 'Client website',
    year: '2026',
    description:
      'A dual-brand real-estate website for Rado Builders and its sister company Sarec, built at Alkhair Innovative Tech Solutions. I designed and built the frontend: a split-screen brand gate, project listings and detail pages, an interactive 3D globe and maps, and smooth GSAP and Lenis animations throughout.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    image: 'rado',
    imagePosition: 'center',
  },
] as const

const skills: [name: string, category: 'fe' | 'be' | 'tl', blurb: string][] = [
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

const processSteps = [
  {
    title: 'Understand',
    description:
      'I start by listening: your goals, your users and your constraints. Then we agree on what success looks like.',
    tags: ['Discovery call', 'Requirements', 'User flows'],
  },
  {
    title: 'Plan & design',
    description:
      'Wireframes, data models and architecture come before production code, so the build is fast and the surprises are few.',
    tags: ['Wireframes', 'System design', 'Tech stack'],
  },
  {
    title: 'Build',
    description:
      'Clean, component-based code shipped in small iterations, with progress you can see and test every week.',
    tags: ['Frontend', 'Backend', 'APIs'],
  },
  {
    title: 'Test & polish',
    description:
      'Cross-device testing, performance tuning and the small details that make a product feel finished.',
    tags: ['QA', 'Performance', 'Accessibility'],
  },
  {
    title: 'Launch & grow',
    description:
      'Deployment, monitoring and steady improvement after launch, so the product keeps growing with you.',
    tags: ['Deployment', 'Monitoring', 'Support'],
  },
]

const experience = [
  {
    title: 'Intern Developer',
    period: 'Aug 2026 to now',
    organization: 'KhairFlow, Karachi',
    description:
      'Working with the engineering team on real web products, following an AI-native development workflow with code reviews and a clear definition of done.',
  },
  {
    title: 'Intermediate, Computer Science',
    period: '2025 to 2027',
    organization: 'G.D.C F/W Block M',
    description:
      'Studying computer science while building games in C, like The Ashen Monastery and Raycast Maze, as college projects.',
  },
]

const contactOptions = ['Website', 'Web app', 'Mobile app', 'Full-time role', 'Something else']

/** Minimal Lexical document: one paragraph made of plain and bold pieces. */
const paragraph = (...pieces: (string | { bold: string })[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: [
      {
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
      },
    ],
  },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = (msg: string) => console.log(`[seed] ${msg}`)

async function exists(payload: Payload, collection: Parameters<Payload['find']>[0]['collection'], field: string, value: string) {
  const res = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    draft: true,
    pagination: false,
  })
  return res.docs[0]
}

async function upsertMedia(payload: Payload, key: keyof typeof images): Promise<number> {
  const { file, alt } = images[key]
  const filename = path.basename(file)
  const found = await exists(payload, 'media', 'filename', filename)
  if (found) {
    log(`media ${filename}: exists, skipped`)
    return found.id as number
  }
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(legacyAssets, file),
  })
  log(`media ${filename}: uploaded`)
  return doc.id
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  const payload = await getPayload({ config })

  // Media
  const mediaIds = {} as Record<keyof typeof images, number>
  for (const key of Object.keys(images) as (keyof typeof images)[]) {
    mediaIds[key] = await upsertMedia(payload, key)
  }

  // Projects
  for (const p of projects) {
    if (await exists(payload, 'projects', 'title', p.title)) {
      log(`project "${p.title}": exists, skipped`)
      continue
    }
    await payload.create({
      collection: 'projects',
      data: {
        title: p.title,
        category: p.category,
        year: p.year,
        description: p.description,
        tags: [...p.tags],
        image: mediaIds[p.image],
        imagePosition: p.imagePosition,
        primaryLink: 'primaryLink' in p ? p.primaryLink : undefined,
        secondaryLink: 'secondaryLink' in p ? p.secondaryLink : undefined,
        _status: 'published',
      },
    })
    log(`project "${p.title}": created`)
  }

  // Skills
  let skillsCreated = 0
  for (const [name, category, blurb] of skills) {
    if (await exists(payload, 'skills', 'name', name)) continue
    await payload.create({ collection: 'skills', data: { name, category, blurb } })
    skillsCreated++
  }
  log(`skills: ${skillsCreated} created, ${skills.length - skillsCreated} skipped`)

  // Process steps
  for (const step of processSteps) {
    if (await exists(payload, 'process-steps', 'title', step.title)) {
      log(`process step "${step.title}": exists, skipped`)
      continue
    }
    await payload.create({ collection: 'process-steps', data: step })
    log(`process step "${step.title}": created`)
  }

  // Experience
  for (const job of experience) {
    if (await exists(payload, 'experience', 'title', job.title)) {
      log(`experience "${job.title}": exists, skipped`)
      continue
    }
    await payload.create({ collection: 'experience', data: job })
    log(`experience "${job.title}": created`)
  }

  // Contact options
  for (const label of contactOptions) {
    if (await exists(payload, 'contact-options', 'label', label)) {
      log(`contact option "${label}": exists, skipped`)
      continue
    }
    await payload.create({ collection: 'contact-options', data: { label, visible: true } })
    log(`contact option "${label}": created`)
  }

  // Site settings: only filled once, so edits made in the admin are never overwritten.
  const current = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (current.metaTitle) {
    log('site settings: already filled, skipped')
  } else {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        // General & SEO
        name: 'Mahnoor',
        fullName: 'Mahnoor Siddiqui',
        metaTitle: 'Mahnoor Siddiqui — Developer',
        metaDescription:
          'Mahnoor Siddiqui is a full-stack developer from Karachi building web apps with React, Next.js, Node.js and Django, and games in C.',
        defaultVibe: 'violet',
        available: true,
        availabilityText: 'Available for new projects',
        // Hero
        intro: 'Software developer building fast, thoughtful products for the web.',
        introMuted: 'Clean code under the hood, careful details on the surface.',
        heroLabel: 'Mahnoor, developer',
        tagline: '[ full-stack & games ]',
        year: '2026',
        marquee: ['Web apps', 'Clean code', 'Interfaces', 'APIs', 'Performance', 'Ideas to launch'].map(
          (word) => ({ word }),
        ),
        // About
        aboutKicker: 'About me',
        manifesto:
          'I turn ideas into software that feels as good as it works, and I care about every detail between the first sketch and the final release.',
        aboutText: paragraph(
          'I’m ',
          { bold: 'Mahnoor Siddiqui' },
          ', a software developer passionate about building modern, scalable digital products. Currently an Intern Developer at KhairFlow, I specialize in responsive web development using React, Next.js, and TypeScript, with experience in Node.js, Django, PostgreSQL, and MySQL. I focus on clean code, modern development workflows, user-focused experiences, and exploring AI-driven solutions.',
        ),
        photo: mediaIds.avatar,
        photoAlt: images.avatar.alt,
        photoTagName: 'Mahnoor',
        photoTagRole: 'developer',
        facts: [
          { value: '2+', label: 'Years coding' },
          { value: '15+', label: 'Projects on GitHub' },
          { value: '2', label: 'Certifications' },
        ],
        // Sections
        workHeading: { lead: 'Selected', accent: 'work' },
        workIntro:
          "A few projects I'm proud of, from web apps to games written in C. Open any of them to see what I built and the tools I used.",
        toolkitHeading: { lead: 'My', accent: 'toolkit' },
        toolkitOverviewTab: 'Overview',
        toolkitTitle: 'Full-stack, with an eye for the interface.',
        toolkitText:
          'I work across the whole product: polished interfaces on the front, reliable APIs and data on the back, and a workflow that keeps it all shipping.',
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
        processIntro: "A clear, collaborative process, so you always know what's happening and what comes next.",
        experienceHeading: { lead: 'My', accent: 'experience' },
        experienceIntro: "Where I've worked, studied and what I've built along the way.",
        // Contact
        contactKicker: 'Start a project',
        contactHeading: { lead: "Got an idea?\nLet's make it", accent: 'real.' },
        contactSubtext:
          "Tell me a little about what you're building. I'll get back to you with next steps, questions, and how I can help.",
        optionsLabel: 'What do you need?',
        nameLabel: 'Your name',
        emailLabel: 'Your email',
        messageLabel: 'Tell me about your project',
        sendLabel: 'Send message',
        formNote: 'I usually reply within a day or two.',
        successMessage: "Thanks! Your message is on its way. I'll get back to you soon.",
        errorMessage: 'Add your name, a valid email and a short message, then send again.',
        location: 'Based in Karachi, Pakistan. Open to internships, freelance and remote work.',
        emailCardTitle: 'Email',
        copyEmailLabel: 'Copy email',
        copiedLabel: 'Copied',
        socialsTitle: 'Find me online',
        // Links
        email: 'mahnoorrr41@gmail.com',
        githubUrl: 'https://github.com/mahnoor986',
        linkedinUrl: 'https://www.linkedin.com/in/mahnoor-siddiqui-tech/',
        ctaLabel: "Let's collab",
        footerText: '© {year} Mahnoor Siddiqui. Designed and built with care.',
        // CV (no PDF yet: the button stays hidden until one is uploaded)
        cvLabel: 'Download CV',
      },
    })
    log('site settings: filled')
  }

  log('done')
}

await seed()
process.exit(0)
