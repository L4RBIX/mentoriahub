# Page Topology — premiercs.com

## Page scroll height: ~18,041px

## Sections (top to bottom)

| # | Name | approx top | height | bg | interaction |
|---|------|-----------|--------|-----|-------------|
| 0 | Navbar | fixed | 48px | transparent → pill blur | scroll-driven show/hide |
| 1 | Hero | 0 | ~1552px (150/200lvh) | black | sticky heading + laptop mockup |
| 2 | Intro | ~1552 | ~853px | dark purple radial gradient | static |
| 3 | Fintech Badges | ~2405 | ~252px | dark/black | scroll marquee |
| 4 | Features Grid | ~2912 | ~746px | black | static 3-col grid |
| 5 | Client Logos | ~3658 | ~759px | premierBase (#e4e7f2) | static grid |
| 6 | Command Center | ~4418 | ~10,055px | black | big scroll section containing: |
| 6a | → Command Intro | ~4657 | ~1251px | black | laptop mockup |
| 6b | → Feature Tabs | ~6004 | ~997px | black | click-driven tabs |
| 6c | → Roles Carousel | ~7001 | ~992px | dark rounded card | click arrows |
| 6d | → Testimonials | ~7994 | ~1066px | black | swiper carousel |
| 6e | → Case Studies Grid | ~9060 | ~1492px | black | static grid |
| 6f | → Reviews Card | ~10550 | ~100px | black | static |
| 6g | → Why Premier list | ~11415 | ~1168px | black | static |
| 6h | → Operational Playbook | ~12583 | ~658px | black card | static |
| 6i | → Trusted Partner | ~13242 | ~1326px | black | #oneteam text + stats |
| 7 | Associations + Pricing | ~14568 | ~1326px | premierBase | static |
| 8 | FAQ | ~15894 | ~1034px | black | accordion |
| 9 | CTA | ~16928 | ~496px | premierBase | static |
| 10 | Footer | ~17424 | ~793px | black | static |

## Layout structure
- Max content width: container (≈1280px) with px-4 lg:px-8 padding
- The page body scrolls normally (no smooth scroll lib detected)
- Navbar is fixed, z-50, transitions from hidden → pill blur on scroll
- Sections alternate between black and premierBase backgrounds

## Z-index layers
- z-50: Navbar (fixed)
- z-10: Intro section (relative z-10)
- z-0: All other sections
