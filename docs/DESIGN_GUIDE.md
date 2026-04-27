# Design Guide — Easy and Accurate Design Changes

The site was built so that visual changes are localised. In most cases you edit one file and the whole site updates.

---

## The big idea: theme lives in one file

**`src/app/globals.css`** is the single source of design truth. It defines:
- Every colour as a CSS variable in `:root`
- The same variables exposed to Tailwind via `@theme inline`
- Base typography rules

When you change a value in `:root`, every component using the corresponding `bg-lilac-500` / `text-text-muted` / etc. updates automatically. No need to find-and-replace across 22 component files.

---

## Common change recipes

### Recipe 1: "I want a different shade of lilac"

The lilac palette has 10 shades from `--color-lilac-50` (lightest) to `--color-lilac-900` (darkest). To shift the brand:

1. Open `src/app/globals.css`
2. Edit the values in `:root`:
   ```css
   --color-lilac-500: #9B72CF;   /* MAIN BRAND COLOUR — change this */
   --color-lilac-600: #8A5FC0;
   --color-lilac-700: #7B52AF;   /* hover/active states */
   ```
3. Save. Dev server hot-reloads. Every button, badge, link uses the new shade.

**WCAG 2.1 AA reminder:** main text colour must contrast against the background by ≥4.5:1. Use https://webaim.org/resources/contrastchecker/ to verify.

### Recipe 2: "Replace lilac with sage green entirely"

1. Pick a 10-step palette from a tool like [tints.dev](https://tints.dev/) or Tailwind's color reference
2. Replace ALL `--color-lilac-*` values in `:root` (rename them too if you want — but then update `@theme inline` to match)
3. The accent colour (`--color-accent`, currently gold) is separate — change or keep
4. Save. Done.

> **Tip:** if you keep the `--color-lilac-*` names but change the values, you don't have to touch any component file. If you rename to `--color-sage-*`, you'd need to update Tailwind classes everywhere (`bg-lilac-500` → `bg-sage-500`). Renaming is rarely worth it.

### Recipe 3: "Different fonts"

The fonts are loaded in **`src/app/layout.tsx`**:
```tsx
import { Playfair_Display, Inter } from "next/font/google";
```

To swap:
1. Pick replacements from [Google Fonts](https://fonts.google.com/)
2. Update the imports — all of Google's fonts are auto-importable
3. Update the `--font-playfair` / `--font-inter` variables in `globals.css` if you renamed them

Example — swap headings to "Cormorant":
```tsx
import { Cormorant_Garamond, Inter } from "next/font/google";

const heading = Cormorant_Garamond({
  variable: "--font-playfair",   // keep the same variable name = no other changes needed
  subsets: ["latin"],
});
```

### Recipe 4: "Adjust spacing, padding, or border radius"

Spacing is via Tailwind's classes (`p-4`, `px-6`, `gap-2`, etc.). To make the whole site more or less airy:

- For **specific components**: edit the className in `src/components/ui/Button.tsx`, `Card.tsx`, etc.
- For **a global tweak** (e.g. all cards become more rounded): change the Card component once — every usage updates
- Tailwind scale: `0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24` (multiplied by 4px) — stick to these for consistency

Border radius:
- Buttons currently `rounded-full` (pill shape) — see `src/components/ui/Button.tsx`
- Cards currently `rounded-2xl` — see `src/components/ui/Card.tsx`
- Inputs currently `rounded-lg` — see `src/components/ui/Input.tsx`

### Recipe 5: "Change a page layout"

Each page is a separate file under `src/app/`:
- Landing: `src/app/page.tsx`
- Login: `src/app/(auth)/login/page.tsx`
- Registry: `src/app/(guest)/registry/page.tsx`
- Gift detail: `src/app/(guest)/gift/[id]/page.tsx`
- Admin dashboard: `src/app/admin/page.tsx`
- (etc.)

Edit the page directly. The `(guest)` route group has a shared layout in `src/app/(guest)/layout.tsx` (the header).

### Recipe 6: "Add a hero image / replace the homepage"

The current homepage (`src/app/page.tsx`) is text-only. To add a hero photo:

1. Drop the image into `public/images/hero.jpg`
2. Use Next.js `<Image>`:
   ```tsx
   import Image from "next/image";

   <div className="relative h-96 w-full">
     <Image src="/images/hero.jpg" alt="Em & Gid" fill className="object-cover" priority />
   </div>
   ```

For multiple photos (a gallery), see the planned `PhotoGallery` component slot in the architecture (`src/components/layout/PhotoGallery.tsx` — not yet built).

---

## Component primitives reference

Change once, every usage updates:

| Component | File | Use it for |
|---|---|---|
| `Button` | `src/components/ui/Button.tsx` | Any button. Has variants: `primary`, `secondary`, `accent`, `ghost` |
| `Input` | `src/components/ui/Input.tsx` | Labelled text input with optional error display |
| `Card` | `src/components/ui/Card.tsx` | Surface with shadow + border for grouping content |
| `Badge` | `src/components/ui/Badge.tsx` | Small status pill (e.g. "Purchased", "Priority", "Fund") |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | Group-gift funding progress |
| `SearchBar` | `src/components/ui/SearchBar.tsx` | Search input with icon |

Layout pieces:

| Component | File | Use it for |
|---|---|---|
| `GuestHeader` | `src/components/layout/GuestHeader.tsx` | Top nav for guest pages |

---

## Mobile testing

Always check changes at three widths:

| Width | Use case |
|---|---|
| **375px** | Smallest common phone (iPhone SE) |
| **768px** | Tablet portrait |
| **1024px+** | Desktop |

In Chrome: `Ctrl+Shift+I` → toggle device toolbar (`Ctrl+Shift+M`) → choose "Responsive" and drag the width.

The grid breakpoints currently in use:
- `sm:` ≥ 640px
- `md:` ≥ 768px
- `lg:` ≥ 1024px
- `xl:` ≥ 1280px

Example from `GiftGrid.tsx`:
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```
1 column on phones, 2 on small tablets, 3 on laptops, 4 on big screens.

---

## Delegate to the design subagent

The `design` subagent at `.claude/agents/design.md` is scoped to:
- `src/app/globals.css` (theme)
- `src/components/ui/` (primitives)
- `src/components/layout/` (page chrome)

It knows the rules: no hardcoded hex codes in components, use the lilac scale, maintain WCAG contrast, mobile-first.

Invoke it for any focused design change:
```
Agent({
  subagent_type: "design",
  description: "Warm up the lilac palette",
  prompt: "Shift the lilac palette in src/app/globals.css toward warmer, slightly pinker tones (think 'mauve' rather than 'cool purple'). Keep the same 10-shade scale. Verify text contrast still meets WCAG AA on the new background colour."
})
```

---

## Things to AVOID

- **Hardcoded hex colours in component files.** Always go through CSS variables.
- **Inline `style={{ color: '...' }}`** — use Tailwind classes referencing theme variables
- **`!important` in CSS** — almost never needed; usually a sign of fighting the cascade
- **Random px values like `p-[13px]`** — use the Tailwind scale (`p-3` = 12px, `p-4` = 16px)
- **Editing `node_modules`** — changes get blown away on every `npm install`

---

## Quick "where do I edit X?" cheat sheet

| What you want to change | Where to edit |
|---|---|
| Lilac shade | `src/app/globals.css` (`--color-lilac-*`) |
| Accent gold | `src/app/globals.css` (`--color-accent`) |
| Background colour | `src/app/globals.css` (`--color-background`) |
| Heading font | `src/app/layout.tsx` (Playfair_Display import) |
| Body font | `src/app/layout.tsx` (Inter import) |
| Button shape / size | `src/components/ui/Button.tsx` |
| Card padding / radius | `src/components/ui/Card.tsx` |
| Homepage hero text | `src/app/page.tsx` |
| Site title in browser tab | `src/app/layout.tsx` (the `metadata` export) |
| Guest header content | `src/components/layout/GuestHeader.tsx` |
| Registry page intro | `src/app/(guest)/registry/page.tsx` |
| Gift card layout | `src/components/gift/GiftCard.tsx` |
| Login page styling | `src/app/(auth)/login/page.tsx` |
