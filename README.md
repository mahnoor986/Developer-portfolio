# Mahnoor — Developer Portfolio

## Run it in VS Code
1. Unzip this folder and open it in VS Code (File → Open Folder…).
2. Install the **Live Server** extension (VS Code will suggest it automatically).
3. Right-click `index.html` → **Open with Live Server**.
4. The site opens at `http://127.0.0.1:5500`. It reloads automatically every time you save.

> Use Live Server (or any local server) rather than double-clicking `index.html`, so the logo images and scripts load correctly.
> An internet connection is needed only for the Google Fonts (Syne, Unbounded, Space Grotesk, Instrument Sans). Everything else is included.

## Project structure
```
index.html          Page content (all sections)
css/style.css       All styles, colour themes (vibes) and responsive rules
js/main.js          Animations, 3D orb, gravity, menu, vibe switcher, form, rocket
assets/logo/        The 7 letters of the "mahnoor" logo (used as masks so they take the theme colour)
assets/images/      Put your photo here
vendor/             Libraries: GSAP + ScrollTrigger, Three.js, Matter.js, Lenis
```

## Quick edits
- **Text, projects, jobs, links:** search `index.html` for anything in `[square brackets]` and replace it.
- **Email:** search for `your@email.com` in `index.html` (it appears in the menu, contact form and footer).
- **Your photo:** see `assets/images/README.txt`.
- **Theme colours:** at the top of `css/style.css`, edit the `:root[data-vibe="violet"]`, `"aqua"` and `"blush"` blocks.
- **Toolkit skills:** the sphere's skill list is the `SK` array in `js/main.js`; the cards are in the Toolkit section of `index.html`.

## Contact form
The form opens the visitor's email app with the message filled in. To receive messages directly,
you can later connect a service such as Formspree.
