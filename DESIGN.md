# DESIGN.md

## 0. Research Log

- Embedded references: shortlist raycast, linear.app, apple. Picked raycast (Layer B) for the command-bar-first desktop utility posture, with taste-skill (Layer A) for restraint. Raycast's dark-marketing surface and red stripe are not carried over: this is an everyday tool, so the palette is macOS-neutral with one blue accent.
- Lazyweb, StyleGallery fetch, imagen drafts: skipped to land the first deploy inside the brief's 2-3 hour window; layout follows layout-skill named primitives instead.
- React dev tooling (react-grab, react-scan, react-doctor): skipped; this is a public static demo and the brief asks for a lean front end.

## 1. Product

LMS helper for one student. Principle (operator, Toss-style): remove login, menus, course picking from the student's head. Open the app and the next thing to do is already there. One screen holds one thing: one big sentence and one big button. Plain words, not school terms. Finishing shows a check and 「끝」, then the next task arrives on its own. Anything else is one sentence away. The app links out to the school LMS; it never submits or writes. Phone width is the primary design; desktop shows the same narrow column centred.

## 2. Colour roles

All in `src/styles/tokens.css`, light and dark: bg, bg-sidebar, bg-hover, bg-wash, surface, surface-raised, border, border-strong, text, text-2, text-3, accent, accent-solid, on-accent, accent-wash, danger, warn, success (+ washes), focus, hue-1..5 for courses. Course hues always sit next to the course name. Urgency is red text plus the label 「24시간 안」, never colour alone.

## 3. Type and spacing

Pretendard Variable, bundled. Desktop 12/13/14/16/20/26 px; phone 13/15/17/19/28 px. Hero sentence (--text-hero): 28 px desktop, 27 px phone; big buttons 56 px tall. Spacing 4-48 px scale. Radius 6/8/12/pill.

## 4. Layout

- Layout: scroll-body-shell. A slim app bar (date or back link, two icon links) is fixed in the grid's first row; `.main` is the single vertical scroll owner. Inside it, `.stage` is a centred column (max 460 px) whose body grows to fill the viewport; `.stage-actions` (the big button) is sticky to the bottom of the stage. Anti-patterns: card grids, sidebars, tab bars, a second page scroller.
- LMS side panel (`#/panel`): list-detail split. Desktop: fake LMS page (1fr) and panel (400 px), each its own scroll owner, `.main` does not scroll. Phone: LMS on top (42%), panel below, each scrolls.

## 5. Screens and primitives

Primitives: btn (lg primary, lg ghost, lg tonal, row, side, secondary, quiet), icon-btn, course-chip, hero-title, hero-sub, ask-entry, say (suggestion row), summary-list, steps, done-mark, row, timeline, tray, toast, segmented, switch, input.

- Home / one-shot intro. Primary: 「한 번에 끝내기」. Priorities: how many tasks today, how many the app can finish alone, which ones. Secondary: 「하나씩 할게요」.
- Home / task. Primary: the task's action (과제 페이지 열기, 강의 틀기, N개 받기, 다 읽었어요, 알림 켜기). Priorities: course, plain-language sentence with the deadline, detail line. Secondary: 「나중에 할게요」, pager arrows, ask entry.
- Home / batch run. Steps finish in order with one result line each; ends with 「끝」 and 「남은 일 N개 하기」.
- Home / done. Check mark, 「끝」, the result line; auto-advances after 1.1 s.
- Home / all done. 「오늘 할 거 다 했어요」.
- Ask. Big input, suggestion rows. Result: big title, the list (timeline, course, course list, summary), one big next-step button.
- Panel. Primary per item: the item's one action. Left out: submit and write buttons.
- Settings. Theme first, then account, sentence-command key, downloads, notifications. Nothing is saved.
- Left out on purpose: dashboard card grid, stat tiles, sidebar, tab bar, course/schedule screens as places to browse.

## 6. Motion

Only for arrivals (stage body, tray, toast: 200 ms rise), the finish check (360 ms pop), the batch spinner, and progress. Reduced motion turns rise and pop into fades.

## 7. Surfaces

Flat surfaces with 1 px neutral borders; one shadow level for floating layers (panel, tray, toast). No blur, no gradients.

## 8. Accepted debt

None yet.
