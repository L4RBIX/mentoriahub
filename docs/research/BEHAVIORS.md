# Behavior Bible — premiercs.com

## Navbar
- **Default (scroll=0):** Hidden above viewport. Class: `lg:-translate-y-[68px]` at `lg:top-5`. White text on transparent bg. No "Book a demo" button visible.
- **Scrolled state:** A pill container with `bg-white/10 backdrop-blur-lg rounded-2xl` appears, containing all nav links + "Book a demo" button. Triggered via JS that adds/removes classes.
- **Transition:** `transition-all duration-300 ease-linear`
- **Book a demo button (scrolled):** Black rounded pill with arrow icon, `bg-white/10 backdrop-blur-lg` pill container holds it
- **Mobile:** Hidden nav items, hamburger menu

## Hero Section (scroll 0→1552px)
- Text is sticky at top, laptop mockup scrolls behind it
- The text "One platform. 360° visibility." fades/reveals on scroll
- Background: dark black with abstract purple/blue wave animation (jpg image)
- Laptop mockup (macbook-mock.png) positioned below the text

## Intro Section (~1552px)
- Dark purple radial gradient background
- Forbes "Best of 2026" badge in top-left
- Large heading left, description + "Book a demo" button right (2-col)
- Elements animate in with opacity transitions as they enter viewport (scroll-driven)

## Fintech Badges (~2405px)
- Dark section with award badge images
- Badges scroll horizontally in a marquee/swiper

## Features Grid (~2912px)
- 3-column grid of feature cards
- Each card: icon (SVG stroke, 32px), title, purple underline rule, description
- Static, no interactions

## Client Logos (~3658px)
- premierBase (#e4e7f2) background
- 5-star rating in purple at top
- 3-row grid of gray-tinted client logos

## Command Center Section (~4418px) — SCROLL-DRIVEN
**INTERACTION MODEL: Scroll-driven.** This 10,055px section contains multiple sub-sections that appear as you scroll:
- Sub-sections stacked vertically, each visible in its own scroll segment
- NOT click-driven tabs at the outer level

### Feature Tabs Sub-section (~6004px)
- **INTERACTION MODEL: CLICK-driven tabs**
- Tabs: Financial Reporting | Construction Accounting | Job Costing | Project Management | Artificial Intelligence | Drawing Management | Time Entry & Labour Cost Tracking
- Active tab: `bg-premierViolet30` (purple), inactive: `border border-premierViolet30/60`
- Content switches on click: laptop screenshot left + feature list right
- Transition: likely opacity/fade

### Roles Carousel Sub-section (~7001px)
- **INTERACTION MODEL: Click-driven (prev/next arrows)**
- 3 roles: Owners & Executives | Project Managers | Accountants / Controllers
- Shows role name (left), image (center), description (right), "Learn more →"
- Navigation: `<` and `>` dark rounded buttons

### Testimonials Sub-section (~7994px)
- **INTERACTION MODEL: Click-driven swiper**
- Video cards with timestamp, name, title, company, quote
- Prev/next arrows
- Below testimonials: 3-col case study cards (logo, company, location, person photo, name, role)

### Why Premier sub-section (~11415px)
- Centered heading, then stacked rows: icon | title | description
- Separator lines between rows

### Operational Playbook (~12583px)
- Dark rounded card: image left (team photo), text right
- "Book a demo" button

### Trusted Technology Partner (~13242px)
- "#oneteam" in huge dark text as decorative background
- Stats grid: 15,000+ users, 60+ software experts, 4 global regions, 2009 year founded
- Staff photos scattered around stats cards

## Associations + Pricing (~14568px)
- premierBase bg
- Association logos row (CFMA, AGC, Toronto, ACQ, BATIMATECH, CICPAC)
- Pricing: 3 cards (Starter $349/mo, Premium $249/mo [Most Popular], Enterprise $125/mo)
- 3D cube decorative elements (images)

## FAQ (~15894px)
- Black bg, 2-column accordion
- First item expanded by default showing full answer
- Chevron icons rotate on open/close

## CTA (~16928px)
- premierBase bg, centered text
- "[ Let's Connect ]" label
- "Scale faster, profit more."
- "Let's talk" button (purple pill with arrow)

## Footer (~17424px)
- Black bg
- Logo + social icons (Instagram, LinkedIn, YouTube)
- Contact + Support info
- 4-column nav links (Features, Who we serve, Resources, About)
- CTA card on right: "10x your business with next-gen Cloud ERP" + "Discover the advantage" button + 3D shape image
