import { ChevronRight } from "lucide-react";
import { assignments, courses, files, lectures, notices } from "../data";
import { href } from "../router";
import { jobFor, useStore } from "../store";

export function Courses() {
  const { watched, read, jobs } = useStore();
  const now = Date.now();
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">과목</h1>
      </header>
      <ul className="course-list">
        {courses.map((c) => {
          const facts = [
            ["마감", assignments.filter((a) => a.courseId === c.id && !a.submitted && a.due.getTime() > now).length],
            ["안 본 강의", lectures.filter((l) => l.courseId === c.id && !watched.has(l.id)).length],
            ["새 공지", notices.filter((n) => n.courseId === c.id && !read.has(n.id)).length],
            ["새 자료", files.filter((f) => f.courseId === c.id && f.isNew && !jobFor(jobs, f.id)).length],
          ] as const;
          const shown = facts.filter(([, n]) => n > 0);
          return (
            <li key={c.id}>
              <a className="course-link" href={href({ name: "course", id: c.id })}>
                <span className={`dot dot-lg hue-${c.hue}`} aria-hidden="true" />
                <span className="course-link-main">
                  <span className="row-title">{c.name}</span>
                  <span className="row-meta">
                    {shown.length ? shown.map(([label, n]) => <span key={label}>{label} {n}</span>) : <span>새 소식 없음</span>}
                  </span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="chev" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
