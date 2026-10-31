import { BookOpen, CalendarDays, House, Settings } from "lucide-react";
import { assignments, courses, files, lectures, notices } from "../data";
import { href, type Route } from "../router";
import { jobFor, useStore } from "../store";

function useBadges() {
  const { watched, read, jobs } = useStore();
  const perCourse = (id: string) =>
    lectures.filter((l) => l.courseId === id && !watched.has(l.id)).length +
    notices.filter((n) => n.courseId === id && !read.has(n.id)).length +
    files.filter((f) => f.courseId === id && f.isNew && !jobFor(jobs, f.id)).length;
  const now = Date.now();
  const todayCount =
    assignments.filter((a) => !a.submitted && a.due.getTime() > now && a.due.getTime() - now < 7 * 86_400_000).length +
    courses.reduce((sum, c) => sum + perCourse(c.id), 0);
  return { perCourse, todayCount };
}

const isActive = (route: Route, name: Route["name"]) =>
  route.name === name || (name === "courses" && route.name === "course");

export function Sidebar({ route }: { route: Route }) {
  const { perCourse, todayCount } = useBadges();
  return (
    <nav className="sidebar" aria-label="주 메뉴">
      <p className="brand">LMS 도우미</p>
      <ul className="nav-list">
        <li>
          <a className="nav-item" href={href({ name: "today" })} aria-current={route.name === "today" ? "page" : undefined}>
            <House size={16} aria-hidden="true" />
            <span>오늘</span>
            {todayCount > 0 && <span className="nav-badge">{todayCount}</span>}
          </a>
        </li>
        <li>
          <a className="nav-item" href={href({ name: "schedule" })} aria-current={route.name === "schedule" ? "page" : undefined}>
            <CalendarDays size={16} aria-hidden="true" />
            <span>일정</span>
          </a>
        </li>
      </ul>
      <p className="nav-group">과목</p>
      <ul className="nav-list">
        {courses.map((c) => {
          const n = perCourse(c.id);
          const current = route.name === "course" && route.id === c.id;
          return (
            <li key={c.id}>
              <a className="nav-item" href={href({ name: "course", id: c.id })} aria-current={current ? "page" : undefined}>
                <span className={`dot hue-${c.hue}`} aria-hidden="true" />
                <span>{c.name}</span>
                {n > 0 && <span className="nav-badge">{n}</span>}
              </a>
            </li>
          );
        })}
      </ul>
      <ul className="nav-list nav-bottom">
        <li>
          <a className="nav-item" href={href({ name: "settings" })} aria-current={route.name === "settings" ? "page" : undefined}>
            <Settings size={16} aria-hidden="true" />
            <span>설정</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}

export function TabBar({ route }: { route: Route }) {
  const { todayCount } = useBadges();
  const tabs: { name: Route["name"]; label: string; icon: typeof House }[] = [
    { name: "today", label: "오늘", icon: House },
    { name: "courses", label: "과목", icon: BookOpen },
    { name: "schedule", label: "일정", icon: CalendarDays },
    { name: "settings", label: "설정", icon: Settings },
  ];
  return (
    <nav className="tabbar" aria-label="주 메뉴">
      {tabs.map(({ name, label, icon: Icon }) => (
        <a
          key={name}
          className="tab"
          href={href({ name } as Route)}
          aria-current={isActive(route, name) ? "page" : undefined}
        >
          <span className="tab-icon">
            <Icon size={22} aria-hidden="true" />
            {name === "today" && todayCount > 0 && <span className="tab-badge">{todayCount}</span>}
          </span>
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
