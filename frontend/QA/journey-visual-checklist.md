# Journey UI Visual Checklist

Purpose: verify mobile‑first parity with Landing reference.

- [ ] Page container width and centering: `max-w-md` on mobile, centered.
- [ ] Background glow: subtle radial blue centered near top (compare to reference).
- [ ] Header: small caps label, hero title font weight and size match `heroTitle` token.
- [ ] Search card: outer `rounded-3xl` + inner `rounded-2xl`; paddings `p-2.5` / `p-3`.
- [ ] Inputs: consistent icon size, focus ring color and radius.
- [ ] Summary card: hero time prominent (`text-2xl`), recommended leave and badge aligned right.
- [ ] Option cards: same inner design as summary but with selectable state (ring + glow).
- [ ] Badges: use `badgeBase` + tones from `boardUi.getStatusBadgeTone`.
- [ ] CTA: sticky bottom, green, correct shadow and safe-area offset.
- [ ] Detail view: hero summary uses same card tokens; step list compact and secondary.
- [ ] Icons: all icons use `lucide-react` with `iconSize` token.
- [ ] Spacing: check `mt-1`, `mt-2`, `gap-2.5` consistency across cards.

How to test:
- Run frontend dev or build and open the Journey page on a 375×812 viewport.
- Compare each checklist item visually against the reference image.
- Note pixel diffs and list adjustments to make.
