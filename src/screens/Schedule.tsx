import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import { useState } from "react";
import { assignments, courseById, lectures } from "../data";
import { addDays, dayDiff, hm, weekStart, weekdayShort } from "../format";
import { useStore } from "../store";

type Item =
  | { kind: "assignment"; id: string; at: Date; title: string; courseId: keyof typeof courseById; done: boolean }
  | { kind: "lecture"; id: string; at: Date; title: string; courseId: keyof typeof courseById; done: boolean };

export function Schedule() {
  const { watched, opened, openAssignment, watch } = useStore();
  const [offset, setOffset] = useState(0);
  const start = weekStart(offset);
  const end = addDays(start, 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const items: Item[] = [
    ...assignments.map((a) => ({
      kind: "assignment" as const,
      id: a.id,
      at: a.due,
      title: a.title,
      courseId: a.courseId,
      done: a.submitted || opened.has(a.id),
    })),
    ...lectures.map((l) => ({
      kind: "lecture" as const,
      id: l.id,
      at: l.until,
      title: `${l.week}주차 ${l.title}`,
      courseId: l.courseId,
      done: watched.has(l.id),
    })),
  ]
    .filter((it) => it.at >= start && it.at < end)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const activate = (it: Item) => {
    if (it.kind === "assignment") {
      const a = assignments.find((x) => x.id === it.id);
      if (a) openAssignment(a);
    } else {
      const l = lectures.find((x) => x.id === it.id);
      if (l) watch(l);
    }
  };

  const rangeLabel = `${start.getMonth() + 1}월 ${start.getDate()}일 – ${addDays(start, 6).getMonth() + 1}월 ${addDays(start, 6).getDate()}일`;
  const weekName = offset === 0 ? "이번 주" : offset === 1 ? "다음 주" : offset === -1 ? "지난주" : rangeLabel;

  return (
    <div className="page">
      <header className="page-head page-head-row">
        <div>
          <h1 className="page-title">일정</h1>
          <p className="page-sub">
            {weekName}
            {offset >= -1 && offset <= 1 && ` · ${rangeLabel}`}
          </p>
        </div>
        <div className="week-nav">
          <button type="button" className="icon-btn icon-btn-bordered" aria-label="이전 주" title="이전 주" onClick={() => setOffset((o) => o - 1)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={offset === 0} onClick={() => setOffset(0)}>
            이번 주
          </button>
          <button type="button" className="icon-btn icon-btn-bordered" aria-label="다음 주" title="다음 주" onClick={() => setOffset((o) => o + 1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <p className="legend">
        <span>
          <ExternalLink size={14} aria-hidden="true" /> 과제 마감
        </span>
        <span>
          <Play size={14} aria-hidden="true" /> 강의 출석 인정 기한
        </span>
      </p>
      <ol className="week">
        {days.map((d) => {
          const dayItems = items.filter((it) => dayDiff(it.at) === dayDiff(d));
          const isToday = dayDiff(d) === 0;
          return (
            <li key={d.toISOString()} className={`day${isToday ? " is-today" : ""}${dayItems.length === 0 ? " is-empty" : ""}`}>
              <p className="day-head">
                <span className="day-name">{weekdayShort(d)}</span>
                <span className="day-num">{d.getDate()}</span>
                {isToday && <span className="day-today">오늘</span>}
              </p>
              {dayItems.length > 0 ? (
                <ul className="day-items">
                  {dayItems.map((it) => (
                    <li key={it.id}>
                      <button type="button" className={`event${it.done ? " is-done" : ""}`} onClick={() => activate(it)}>
                        <span className="event-time">
                          {it.kind === "assignment" ? <ExternalLink size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
                          {hm(it.at)}
                          {it.done && <span className="event-done">{it.kind === "assignment" ? "완료" : "봤음"}</span>}
                        </span>
                        <span className="event-title">{it.title}</span>
                        <span className="course-tag">
                          <span className={`dot hue-${courseById[it.courseId].hue}`} aria-hidden="true" />
                          {courseById[it.courseId].name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="day-empty">일정 없음</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
