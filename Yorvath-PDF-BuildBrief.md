# BUILD BRIEF — Yorvath Palefang, Volkihar Vampire Lord application (designed PDF)

Hand this whole file to Claude Code. Goal: turn the plain-text application into a beautiful, gothic, print-quality PDF that does NOT look AI-generated or templated. There's already a rough reportlab version, you can beat it.

## Files in this folder
- `yorvath-palefang-application.md` — the full application text. This is the content. Use it as-is; do not rewrite the wording, the voice is intentional (plain, human, no em dashes).
- `Yorvath-Palefang-Application.pdf` — my first attempt. Reference for content and rough direction ONLY. Its problems: the cover/top area is weak, and vertical spacing/alignment is inconsistent (headers sit too tight to the text above them, some list blocks don't align). Fix both.

## What to build
A multi-page A4 PDF, a whitelist application for a Volkihar Vampire Lord in an Elder Scrolls RP server (setting: 4E 185, Harkon's court). It should feel like an in-world gothic document: old, cold, aristocratic, a little sinister. Think a dark manuscript from a vampire's own hand, not a resume.

## Visual direction
- **Mood:** gothic, cold, Nordic-vampiric. Restrained and expensive-looking, not Halloween-spooky. Volkihar are icy, ancient, proud.
- **Palette:** cold bone/ivory parchment for the body pages; near-black for the cover; oxblood red (#7c1f1f) as the single accent; cold silver/frost (#9aa1a8 / #6f8794) for secondary accents. Use red sparingly, it should feel like blood on old paper.
- **Cover page (this is the part I most want improved):** a proper title page on a dark background. A real emblem/sigil (a blood drop, a fanged crest, a frost-and-blood motif, your call, make it genuinely nice, ideally a crafted SVG or a subtle vector, not a clumsy shape). Character name large in a serif or blackletter display face. Epigraph at the bottom: *"Power is not the strongest teeth in the room. Power is being the last one still in it."* Keep it elegant and sparse.
- **Typography:** use real fonts if you have them available. A gothic/blackletter or high-contrast serif for the display/cover (something like Cormorant, EB Garamond, Cinzel, or an actual blackletter for accents), and a clean readable serif for body. Do NOT use default Helvetica/Times if you can avoid it, that's part of what makes it read as generic.
- **Section headers:** distinctive, carved-looking, with a small blood motif. Consistent vertical rhythm, give them real breathing room above (this was the alignment problem, headers were crammed against the previous paragraph).
- **Body:** justified serif columns, generous leading, a drop cap on the opening paragraph. Question labels in oxblood, answers in dark ink beneath.
- **Nice touches if easy:** subtle paper/parchment texture, a faint page border, a running footer (character name · "Volkihar Vampire Lord · 4E 185" · page number), pull-quotes for a couple of the strongest lines, and tasteful section dividers.

## Structure (follow the .md's sections in order)
1. Cover page
2. Opening address ("to the court") with drop cap
3. Character Basics
4. Background & Motivations
5. Disciplines, Lore & The Gift (has bulleted lists, keep them clean and aligned)
6. Basic Knowledge (Q&A lore section)
7. Advanced Character Information
8. Scenarios (five long ones)
9. The Long Dark (the in-character closing monologue, give this its own page/spread, make it feel like the emotional finale)

## Hard requirements
- **Fix the spacing/alignment.** Consistent space-before on every section header, consistent paragraph spacing, lists that align flush. Nothing crammed against the header above it.
- **No em dashes anywhere** in the rendered text. (Commas, colons, or full stops instead.) The content file already follows this; keep it that way.
- Keep ALL the content from the .md. Don't cut answers.
- A4, print-ready, embeddable fonts.
- Output a single PDF. If you build it as HTML/CSS and render to PDF (e.g. via a headless browser / Prince / weasyprint), that's ideal, you'll get far better typography and texture control than a reportlab script, and it's probably what my setup is good at.

## Deliverable
One polished PDF plus the source (HTML/CSS or whatever you build it in) so I can tweak it later. Show me a screenshot of the cover and one interior page when done, and tell me how to regenerate it.
