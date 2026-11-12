# Contract: Design

> Human-authored. Read-only to agents. Facts here override anything an agent infers from the code.

## What this site is

A **satirical fake news publication**. Every article, image, recipe and horoscope is AI-generated
and openly presented as fake. The joke only works if the presentation is dead serious: the site
must look and behave like a real news site, because the humour comes from the gap between the
straight-faced product and the absurd content.

## Non-negotiable rules

1. **No visible "this is a joke" framing inside the article bodies.** Satire is delivered by
   content, never by a disclaimer plastered over the layout.
2. **Serious chrome, absurd content.** Typography, spacing and navigation should read as a real
   publication. Do not make the UI itself wry, meme-y, or deliberately ugly.
3. **Content is never invented on the read path.** What the API returns is what exists in the
   database. No template text, no "sample" filler, no read-time fallbacks — see
   `architecture.md`.
4. **AI-generated images are the default illustration.** No stock-photo service, no external image
   hotlinking.
5. **Every article carries its content source** (`live` vs `dev`/mock). Dev content must never be
   mistakable for live content in the UI or in the DB.

## Pages the public site must have

| Page             | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| Home             | Lead story plus a feed of recent articles, grouped by category |
| Category listing | All articles in one section (news, recipes, horoscopes, …)     |
| Article          | Full article: title, hero image, byline-ish metadata, body     |
| Recipes          | Recipe-shaped content with ingredients and steps               |
| Horoscopes       | Daily horoscopes, one entry per sign                           |

The public site is a **React SPA** in `client/`. The admin panel in `admin/` is a separate app on
its own subdomain and must not share routes or bundle code with the client.

## Tone and copy

- Headlines: plain, declarative, no exclamation marks. The absurdity should be in the claim, not
  in the punctuation.
- Byline-less. There is no real journalist; do not invent an editorial staff page.
- No real, living, identifiable private people as subjects of fabricated claims. Public figures in
  implausible, obviously satirical situations only.
- Anything that reads as a genuine health, financial or safety instruction must be absurd enough to
  be unmistakable, or it does not ship.

## Visual system

- **Design tokens over ad-hoc values.** Colours, spacing, radius and type scale come from the
  theme layer; do not hardcode hex values in components. (`client/TAILWIND_MIGRATION_PLAN.md`
  records the move to Tailwind — follow the direction already taken there.)
- **One design system for admin.** The admin panel keeps its own design system; do not bleed
  client styles into it.
- **Mobile first.** Every public page must be usable at 360px wide.
- **Accessibility floor:** semantic landmarks, alt text on images, visible focus states,
  contrast that passes WCAG AA for body text.
- **No layout jank on image load.** Reserve aspect-ratio boxes for hero and card images.

## What agents may freely change

Layout implementation details, component structure, CSS technique, animation timing, and copy
_inside_ generated content — as long as the rules above hold. Changing the rules above is a
contract change, and contract changes are human-only.
