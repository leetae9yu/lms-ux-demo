import { Bell, Check, Download, FileText, Megaphone, Play, CalendarPlus, Video } from "lucide-react";
import { useState } from "react";
import type { Outcome } from "../commands";
import { CommandInput, useRunner } from "../components/CommandInput";
import { ResultCard, Summary } from "../components/ResultCard";
import { assignments, files, lectures, notices } from "../data";
import { dueLabel, humanTime } from "../format";
import { jobFor, useStore } from "../store";

type Page = "home" | "hw" | "notice";
const PAGES: { id: Page; label: string; path: string }[] = [
  { id: "home", label: "강의 홈", path: "course/ds" },
  { id: "hw", label: "과제 3", path: "course/ds/assign/3" },
  { id: "notice", label: "공지", path: "course/ds/notice/41" },
];

const a1 = assignments.find((a) => a.id === "a1")!;
const n1 = notices.find((n) => n.id === "n1")!;
const l2 = lectures.find((l) => l.id === "l2")!;
const newFiles = files.filter((f) => f.courseId === "ds" && f.isNew);
const spec = files.find((f) => f.id === "f7")!;

/** A stand-in school LMS page. Plain on purpose: it is the screen the student has today. */
function FakeLms({ page }: { page: Page }) {
  const ds = files.filter((f) => f.courseId === "ds");
  if (page === "hw")
    return (
      <div className="lms-body">
        <h2 className="lms-h">과제 3: 이진 탐색 트리 구현</h2>
        <table className="lms-table">
          <tbody>
            <tr><th>마감</th><td>{dueLabel(a1.due)}</td></tr>
            <tr><th>배점</th><td>100점</td></tr>
            <tr><th>제출 상태</th><td>제출 안 함</td></tr>
            <tr><th>첨부</th><td><FileText size={14} aria-hidden="true" /> {spec.name}</td></tr>
          </tbody>
        </table>
        <p className="lms-p">명세서에 적힌 연산을 모두 구현하고, 테스트 케이스 결과를 보고서에 붙여 내세요. 늦게 내면 하루에 10%씩 감점합니다.</p>
      </div>
    );
  if (page === "notice")
    return (
      <div className="lms-body">
        <h2 className="lms-h">{n1.title}</h2>
        <p className="lms-meta">작성자 조교 · 조회 128</p>
        <p className="lms-p">{n1.body}</p>
        <p className="lms-p">질문은 다음 주 화요일 실습 시간 전까지 게시판에 올려 주세요. 채점 결과는 마감 일주일 뒤에 공개합니다.</p>
      </div>
    );
  return (
    <div className="lms-body">
      <h2 className="lms-h">자료구조 (가상 강좌)</h2>
      <div className="lms-box">
        <p className="lms-box-title">공지</p>
        <p className="lms-p">{n1.title}</p>
      </div>
      {[9, 8].map((w) => (
        <div key={w} className="lms-week">
          <p className="lms-week-title">{w}주차</p>
          <ul className="lms-items">
            {w === 9 && (
              <li><Video size={14} aria-hidden="true" /> [동영상] {l2.title} ({l2.minutes}분)</li>
            )}
            {ds.filter((f) => f.week === w).map((f) => (
              <li key={f.id}><FileText size={14} aria-hidden="true" /> {f.name}</li>
            ))}
            {w === 8 && <li><FileText size={14} aria-hidden="true" /> [과제] {a1.title}</li>}
          </ul>
        </div>
      ))}
    </div>
  );
}

type Item = { key: string; icon: typeof Bell; text: string; sub?: string; label: string; done: boolean; busy?: boolean; doneLabel: string; run: () => void; extra?: boolean };

export function Panel() {
  const { jobs, downloaded, watched, read, reminders, download, watch, markRead, remind, showToast } = useStore();
  const runner = useRunner();
  const [page, setPage] = useState<Page>("home");
  const [summarized, setSummarized] = useState(false);
  const [calendared, setCalendared] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const allDone = (list: typeof newFiles) => list.every((f) => downloaded.has(f.id));
  const busy = (list: typeof newFiles) => !allDone(list) && list.every((f) => jobFor(jobs, f.id));
  const summarize: Item = {
    key: "sum",
    icon: Megaphone,
    text: "공지 한 줄 요약",
    sub: summarized ? undefined : n1.title,
    label: "요약 보기",
    done: summarized,
    doneLabel: "끝",
    run: () => {
      setSummarized(true);
      markRead([n1.id]);
    },
    extra: summarized,
  };
  const alarm: Item = {
    key: "alarm",
    icon: Bell,
    text: `과제 3, ${humanTime(a1.due)}까지 내야 해요`,
    sub: "마감 1시간 전에 한 번 더 알려 드려요",
    label: "알림 켜기",
    done: reminders.has(a1.id),
    doneLabel: "켰어요",
    run: () => {
      remind([a1.id]);
      showToast("과제 3 마감 알림을 켰어요");
    },
  };
  const items: Record<Page, Item[]> = {
    home: [
      {
        key: "files",
        icon: Download,
        text: `이 화면에 새 자료 ${newFiles.length}개`,
        sub: newFiles.map((f) => f.name).join("\n"),
        label: `${newFiles.length}개 받기`,
        done: allDone(newFiles),
        busy: busy(newFiles),
        doneLabel: "받았어요",
        run: () => download(newFiles),
      },
      {
        key: "lecture",
        icon: Play,
        text: `이번 주 강의, ${humanTime(l2.until).replace(/\s자정\s전$/, "")}까지 봐야 출석 인정돼요`,
        sub: `${l2.title} · ${l2.minutes}분`,
        label: "틀기",
        done: watched.has(l2.id),
        doneLabel: "틀었어요",
        run: () => watch(l2),
      },
      alarm,
      summarize,
    ],
    hw: [
      alarm,
      {
        key: "spec",
        icon: Download,
        text: "과제 명세서",
        sub: spec.name,
        label: "받기",
        done: downloaded.has(spec.id),
        busy: busy([spec]),
        doneLabel: "받았어요",
        run: () => download([spec]),
      },
      summarize,
    ],
    notice: [
      summarize,
      {
        key: "cal",
        icon: CalendarPlus,
        text: "공지에 나온 날짜를 일정에 넣기",
        sub: "다음 주 화요일 실습 시간",
        label: "넣기",
        done: calendared,
        doneLabel: "넣었어요",
        run: () => {
          setCalendared(true);
          showToast("다음 주 화요일 실습 시간을 일정에 넣었어요");
        },
      },
    ],
  };
  const current = PAGES.find((p) => p.id === page)!;
  const unread = !read.has(n1.id);

  return (
    <div className="split">
      <section className="lms" aria-label="가상 LMS 화면">
        <div className="lms-bar">
          <span className="lms-url">lms.example.edu/{current.path}</span>
          <span className="lms-tag">가상 화면</span>
        </div>
        <nav className="lms-tabs" aria-label="가상 LMS 메뉴">
          {PAGES.map((p) => (
            <button key={p.id} type="button" className="lms-tab" aria-current={p.id === page ? "page" : undefined} onClick={() => { setPage(p.id); setOutcome(null); }}>
              {p.label}
              {p.id === "notice" && unread && <span className="lms-new">N</span>}
            </button>
          ))}
        </nav>
        <FakeLms page={page} />
      </section>

      <aside className="side" aria-label="이 화면에서 할 일">
        <p className="eyebrow">자료구조 · {current.label}</p>
        <h1 className="side-title">이 화면에서 할 일</h1>
        <ul className="side-list">
          {items[page].map((it) => (
            <li key={it.key} className="side-item">
              <it.icon size={18} aria-hidden="true" className="side-icon" />
              <div className="side-text">
                <p className="side-main">{it.text}</p>
                {it.sub && <p className="side-sub">{it.sub}</p>}
                {it.extra && <Summary items={[n1]} />}
              </div>
              <button type="button" className={`btn btn-side${it.done ? " is-done" : ""}`} disabled={it.done || it.busy} onClick={it.run}>
                {it.done && <Check size={16} aria-hidden="true" />}
                <span>{it.done ? it.doneLabel : it.busy ? "받는 중" : it.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="side-note">과제를 내거나 글을 쓰는 건 학교 화면에서 해요.</p>
        <CommandInput
          id="panel-input"
          label="이 과목에 대해 한 문장으로 묻기"
          placeholder="예: 자료구조 안 본 강의 있어?"
          size="sm"
          shortcuts={false}
          onRun={(text) => {
            const r = runner(text.includes("자료구조") ? text : `자료구조 ${text}`);
            if (r.kind !== "navigate" && r.kind !== "theme") setOutcome(r);
          }}
        />
        {outcome && (
          <div className="side-result">
            <ResultCard
              outcome={outcome}
              onRun={(t) => {
                const r = runner(t);
                if (r.kind !== "navigate" && r.kind !== "theme") setOutcome(r);
              }}
            />
          </div>
        )}
      </aside>
    </div>
  );
}
