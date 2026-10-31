import { courseById } from "../data";
import type { Outcome } from "../commands";
import { AssignmentRow, FileRow, LectureRow } from "./Rows";
import { useStore } from "../store";

export function ResultCard({ outcome }: { outcome: Outcome }) {
  const { markRead } = useStore();
  return (
    <div className="result" role="status" aria-live="polite">
      <p className="result-title">{outcome.title}</p>
      {outcome.kind === "deadlines" && outcome.items.length > 0 && (
        <ul className="list">
          {outcome.items.map((a) => (
            <AssignmentRow key={a.id} a={a} />
          ))}
        </ul>
      )}
      {outcome.kind === "lectures" && outcome.items.length > 0 && (
        <ul className="list">
          {outcome.items.map((l) => (
            <LectureRow key={l.id} l={l} />
          ))}
        </ul>
      )}
      {outcome.kind === "download" && outcome.files.length > 0 && (
        <ul className="list">
          {outcome.files.map((f) => (
            <FileRow key={f.id} f={f} />
          ))}
        </ul>
      )}
      {outcome.kind === "notices" && outcome.items.length > 0 && (
        <>
          <ul className="summary-list">
            {outcome.items.map((n) => (
              <li key={n.id}>
                <span className="summary-course">{courseById[n.courseId].name}</span>
                <span>{n.summary}</span>
              </li>
            ))}
          </ul>
          <div className="result-actions">
            <button type="button" className="btn btn-quiet" onClick={() => markRead(outcome.items.map((n) => n.id))}>
              모두 읽음으로 표시
            </button>
          </div>
        </>
      )}
    </div>
  );
}
