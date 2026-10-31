import { Download } from "lucide-react";
import { runCommand } from "../components/CommandBar";
import { AssignmentRow, FileRow, LectureRow, NoticeRow } from "../components/Rows";
import { Section } from "../components/Section";
import { assignments, files, lectures, notices, suggestions } from "../data";
import { fullDate, today0 } from "../format";
import { jobFor, useStore } from "../store";

const WEEK_MS = 7 * 86_400_000;

export function Today() {
  const { watched, read, opened, jobs, download } = useStore();
  const now = Date.now();
  const due = assignments
    .filter((a) => !a.submitted && a.due.getTime() > now && a.due.getTime() - now < WEEK_MS)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
  const pendingLectures = lectures.filter((l) => !l.watchedAtStart).sort((a, b) => a.until.getTime() - b.until.getTime());
  const newNotices = notices.filter((n) => !n.readAtStart);
  const newFiles = files.filter((f) => f.isNew);
  const notTaken = newFiles.filter((f) => !jobFor(jobs, f.id));

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">오늘 할 일</h1>
        <p className="page-sub">{fullDate(today0)}</p>
      </header>
      <ul className="chips" aria-label="자주 쓰는 문장">
        {suggestions.slice(0, 4).map((s) => (
          <li key={s}>
            <button type="button" className="chip" onClick={() => runCommand(s)}>
              {s}
            </button>
          </li>
        ))}
      </ul>
      <div className="grid-2">
        <Section title="마감 임박" count={due.filter((a) => !opened.has(a.id)).length} empty="7일 안에 마감되는 과제가 없어요.">
          {due.map((a) => (
            <AssignmentRow key={a.id} a={a} />
          ))}
        </Section>
        <Section
          title="안 본 강의"
          count={pendingLectures.filter((l) => !watched.has(l.id)).length}
          empty="밀린 녹화강의가 없어요."
        >
          {pendingLectures.map((l) => (
            <LectureRow key={l.id} l={l} />
          ))}
        </Section>
        <Section title="새 공지" count={newNotices.filter((n) => !read.has(n.id)).length} empty="새 공지가 없어요.">
          {newNotices.map((n) => (
            <NoticeRow key={n.id} n={n} />
          ))}
        </Section>
        <Section
          title="새 강의자료"
          count={notTaken.length}
          empty="새로 올라온 자료가 없어요."
          action={
            notTaken.length > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => download(notTaken)}>
                <Download size={15} aria-hidden="true" />
                <span>모두 받기</span>
              </button>
            )
          }
        >
          {newFiles.map((f) => (
            <FileRow key={f.id} f={f} />
          ))}
        </Section>
      </div>
    </div>
  );
}
