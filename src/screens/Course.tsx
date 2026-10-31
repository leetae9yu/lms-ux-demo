import { Check, Download } from "lucide-react";
import { AssignmentRow, FileRow, LectureRow, NoticeRow } from "../components/Rows";
import { Section } from "../components/Section";
import { assignments, courseById, files, lectures, notices, type CourseId } from "../data";
import { jobFor, useStore } from "../store";

export function Course({ id }: { id: CourseId }) {
  const { watched, read, jobs, download } = useStore();
  const c = courseById[id];
  const myAssignments = assignments
    .filter((a) => a.courseId === id)
    .sort((a, b) => Number(a.submitted) - Number(b.submitted) || a.due.getTime() - b.due.getTime());
  const myLectures = lectures.filter((l) => l.courseId === id).sort((a, b) => b.week - a.week);
  const myFiles = files.filter((f) => f.courseId === id).sort((a, b) => b.week - a.week);
  const myNotices = notices.filter((n) => n.courseId === id);
  const notTaken = myFiles.filter((f) => !jobFor(jobs, f.id));
  const running = myFiles.some((f) => {
    const s = jobFor(jobs, f.id)?.state;
    return s === "queued" || s === "active";
  });

  return (
    <div className="page">
      <header className="page-head page-head-row">
        <div>
          <h1 className="page-title">
            <span className={`dot dot-lg hue-${c.hue}`} aria-hidden="true" />
            {c.name}
          </h1>
          <p className="page-sub">{c.prof} 교수</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-wide"
          disabled={notTaken.length === 0}
          onClick={() => download(notTaken)}
        >
          {notTaken.length > 0 ? <Download size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
          <span>{notTaken.length > 0 ? `자료 ${notTaken.length}개 모두 받기` : running ? "받는 중" : "자료를 모두 받았어요"}</span>
        </button>
      </header>
      <div className="grid-2">
        <Section title="과제" count={myAssignments.filter((a) => !a.submitted).length} empty="등록된 과제가 없어요.">
          {myAssignments.map((a) => (
            <AssignmentRow key={a.id} a={a} showCourse={false} />
          ))}
        </Section>
        <Section title="녹화강의" count={myLectures.filter((l) => !watched.has(l.id)).length} empty="올라온 강의가 없어요.">
          {myLectures.map((l) => (
            <LectureRow key={l.id} l={l} showCourse={false} />
          ))}
        </Section>
        <Section title="강의자료" count={notTaken.length} empty="올라온 자료가 없어요.">
          {myFiles.map((f) => (
            <FileRow key={f.id} f={f} showCourse={false} />
          ))}
        </Section>
        <Section title="공지" count={myNotices.filter((n) => !read.has(n.id)).length} empty="공지가 없어요.">
          {myNotices.map((n) => (
            <NoticeRow key={n.id} n={n} showCourse={false} />
          ))}
        </Section>
      </div>
    </div>
  );
}
