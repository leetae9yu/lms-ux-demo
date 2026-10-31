# DESIGN.md

## 0. Research Log

- Embedded references: shortlist raycast, linear.app, apple. Picked raycast (Layer B) for the command-bar-first desktop utility posture, with taste-skill (Layer A) for restraint. Raycast's dark-marketing surface and red stripe are not carried over: this is an everyday tool, so the palette is macOS-neutral with one blue accent.
- Lazyweb, StyleGallery fetch, imagen drafts: skipped to land the first deploy inside the brief's 2-3 hour window; layout follows layout-skill named primitives instead.
- React dev tooling (react-grab, react-scan, react-doctor): skipped; this is a public static demo and the brief asks for a lean front end.

## 1. Product

LMS helper for one student. The app links out to the school LMS; it never submits or writes. Every frequent task finishes in one or two clicks or one sentence.

## 2. Colour roles

All in `src/styles/tokens.css`, light and dark: bg, bg-sidebar, bg-hover, bg-wash, surface, surface-raised, border, border-strong, text, text-2, text-3, accent, accent-solid, on-accent, accent-wash, danger, warn, success (+ washes), focus, hue-1..5 for courses. Course hues always sit next to the course name. Urgency is red text plus the label 「24시간 안」, never colour alone.

## 3. Type and spacing

Pretendard Variable, bundled. Desktop 12/13/14/16/20/26 px; phone 13/15/17/19/28 px. Spacing 4-48 px scale. Radius 6/8/12/pill.

## 4. Layout

- Layout: fixed-sidenav-shell. Sidebar (232 px) fixed; `.main` is the single vertical scroll owner; `.topbar` (command bar) is sticky inside it. Anti-patterns: whole-document scroll, a second scroller beside main.
- Phone (< 768 px): sidebar hidden, bottom tab bar (오늘, 과목, 일정, 설정) in the grid's second row; `.main` still owns scroll. The suggestion chips row is a horizontal reel.
- Today and course pages: intrinsic grid of sections, `repeat(auto-fit, minmax(min(26rem, 100%), 1fr))`.
- Schedule: 7-column week grid at >= 1024 px, one row per day below that.
- The command panel is the one nested scroller (its own results).

## 5. Screens and primitives

Primitives: btn (primary, secondary, quiet, row, sm), icon-btn, chip, section (head + count + list), row (title, meta, one action), course-tag, segmented, switch, input, tray, toast.

- Today. Primary action: the command bar. Priorities: 1 deadlines within 7 days, 2 unwatched lectures, 3 new notices and new files. Left out: stat tiles, greeting copy, per-section subtitles, submit buttons.
- Command panel. Primary: Enter on the sentence. Shows a result card, then suggestion sentences.
- Course. Primary: 「자료 N개 모두 받기」. Then assignments, lectures, files, notices.
- Schedule. Primary: none beyond the items; week navigation is secondary.
- Settings. Theme first, then account, sentence-command key, downloads, notifications. Nothing is saved.

## 6. Motion

Only for arrivals (panel, tray, toast: 200 ms rise) and progress. Reduced motion turns them into fades.

## 7. Surfaces

Flat surfaces with 1 px neutral borders; one shadow level for floating layers (panel, tray, toast). No blur, no gradients.

## 8. Accepted debt

None yet.
