import { ArrowDown, ArrowLeft, ArrowUp, Check, LoaderCircle, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Outcome } from "../commands";
import { CommandInput, useRunner } from "../components/CommandInput";
import { ResultCard, Summary } from "../components/ResultCard";
import { courseById, suggestions } from "../data";
import { jobFor, useStore } from "../store";
import { useTasks, type Task } from "../tasks";

type Mode = "tasks" | "ask" | "result" | "batch";

const DONE_MS = 1100;

function CourseChip({ task }: { task: Task }) {
  if (!task.courseId) return null;
  const c = courseById[task.courseId];
  return (
    <span className="course-chip">
      <span className={`dot hue-${c.hue}`} aria-hidden="true" />
      {c.name}
    </span>
  );
}

/** A finished step: check mark, the one-line result, then the app moves on by itself. */
function DoneScreen({ line }: { line: string }) {
  return (
    <div className="stage-body done" role="status">
      <span className="done-mark" aria-hidden="true">
        <Check size={40} strokeWidth={3} />
      </span>
      <p className="hero-title">끝</p>
      <p className="hero-sub">{line}</p>
    </div>
  );
}

export function Home() {
  const store = useStore();
  const { jobs, downloaded } = store;
  const tasks = useTasks();
  const runner = useRunner();
  const [mode, setMode] = useState<Mode>("tasks");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<{ line: string; nextId: string | null } | null>(null);
  const [waiting, setWaiting] = useState<Task | null>(null);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [batch, setBatch] = useState<{ items: Task[]; step: number } | null>(null);
  const started = useRef(new Set<string>());
  const touchY = useRef<number | null>(null);

  const auto = tasks.filter((t) => t.auto);
  const showIntro = mode === "tasks" && !introDismissed && batch === null && auto.length >= 2;
  const index = Math.max(0, tasks.findIndex((t) => t.id === cursor));
  const current = tasks[index];

  const move = (step: number) => {
    if (tasks.length < 2) return;
    setCursor(tasks[(index + step + tasks.length) % tasks.length].id);
  };

  const finish = (task: Task) => {
    const rest = tasks.filter((t) => t.id !== task.id);
    const nextId = rest.length ? rest[Math.min(index, rest.length - 1)].id : null;
    setFinishing({ line: task.doneLine, nextId });
  };

  const act = (task: Task) => {
    task.run();
    if (task.kind === "files") setWaiting(task);
    else finish(task);
  };

  // A file task finishes when its downloads do.
  useEffect(() => {
    if (waiting?.files && waiting.files.every((f) => downloaded.has(f.id))) {
      setWaiting(null);
      finish(waiting);
    }
  });

  useEffect(() => {
    if (!finishing) return;
    const t = window.setTimeout(() => {
      setCursor(finishing.nextId);
      setFinishing(null);
    }, DONE_MS);
    return () => window.clearTimeout(t);
  }, [finishing]);

  // "Do everything": run each automatic task in order, one result line at a time.
  useEffect(() => {
    if (!batch || batch.step >= batch.items.length) return;
    const t = batch.items[batch.step];
    if (!started.current.has(t.id)) {
      started.current.add(t.id);
      t.run();
    }
    const ready = t.kind !== "files" || (t.files ?? []).every((f) => downloaded.has(f.id));
    if (!ready) return;
    const h = window.setTimeout(() => setBatch((b) => b && { ...b, step: b.step + 1 }), t.kind === "files" ? 300 : 700);
    return () => window.clearTimeout(h);
  }, [batch, downloaded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMode("ask");
      } else if (e.key === "/") {
        e.preventDefault();
        setMode("ask");
      } else if (mode === "tasks" && !finishing && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        move(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Escape" && mode !== "tasks") {
        setMode("tasks");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const run = (text: string) => {
    const result = runner(text);
    if (result.kind === "navigate") return;
    if (result.kind === "theme") {
      store.showToast(result.title);
      setMode("tasks");
      return;
    }
    setOutcome(result);
    setMode("result");
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") touchY.current = e.clientY;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (touchY.current === null) return;
    const dy = e.clientY - touchY.current;
    touchY.current = null;
    if (Math.abs(dy) > 60 && mode === "tasks" && !finishing && !showIntro) move(dy < 0 ? 1 : -1);
  };

  const back = (
    <button type="button" className="btn btn-ghost back" onClick={() => setMode("tasks")}>
      <ArrowLeft size={18} aria-hidden="true" />
      <span>할 일로 돌아가기</span>
    </button>
  );

  const askEntry = (
    <button type="button" className="ask-entry" onClick={() => setMode("ask")}>
      <Search size={18} aria-hidden="true" />
      <span>다른 게 필요하면 한 문장으로 말해 주세요</span>
    </button>
  );

  let screen;
  if (mode === "ask") {
    screen = (
      <div className="stage-body stage-top">
        {back}
        <h1 className="hero-title">무엇을 할까요?</h1>
        <CommandInput
          id="ask-input"
          label="한 문장으로 말하기"
          placeholder="예: 이번 주 마감 뭐 있어"
          size="lg"
          shortcuts
          autoFocus
          onRun={run}
        />
        <ul className="say-list" aria-label="이렇게 말해 보세요">
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" className="say" onClick={() => run(s)}>
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (mode === "result" && outcome) {
    screen = (
      <div className="stage-body stage-top">
        {back}
        <ResultCard outcome={outcome} onRun={run} />
        {outcome.kind === "unknown" && (
          <ul className="say-list">
            {suggestions.map((s) => (
              <li key={s}>
                <button type="button" className="say" onClick={() => run(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
        {askEntry}
      </div>
    );
  } else if (mode === "batch" && batch) {
    const finished = batch.step >= batch.items.length;
    screen = (
      <div className="stage-body">
        <h1 className="hero-title">{finished ? "끝" : "하나씩 끝내는 중이에요"}</h1>
        <ol className="steps">
          {batch.items.map((t, i) => {
            const state = i < batch.step ? "done" : i === batch.step ? "now" : "wait";
            const files = t.files ?? [];
            const pct =
              files.length > 0
                ? Math.round((files.reduce((s, f) => s + (jobFor(jobs, f.id)?.progress ?? 0), 0) / files.length) * 100)
                : null;
            return (
              <li key={t.id} className={`step is-${state}`}>
                <span className="step-mark" aria-hidden="true">
                  {state === "done" ? <Check size={16} strokeWidth={3} /> : state === "now" ? <LoaderCircle size={16} className="spin" /> : null}
                </span>
                <div className="step-text">
                  <p>
                    {state === "done" ? `${t.doneLine}. 끝` : state === "now" ? t.doing : t.headline}
                    {state === "now" && pct !== null && <span className="step-pct"> {pct}%</span>}
                  </p>
                  {state === "done" && t.summary && <Summary items={t.summary} />}
                </div>
              </li>
            );
          })}
        </ol>
        {finished && (
          <div className="stage-actions">
            <button
              type="button"
              className="btn btn-lg btn-primary"
              onClick={() => {
                setBatch(null);
                setIntroDismissed(true);
                setMode("tasks");
              }}
            >
              {tasks.length ? `남은 일 ${tasks.length}개 하기` : "확인"}
            </button>
          </div>
        )}
      </div>
    );
  } else if (finishing) {
    screen = <DoneScreen line={finishing.line} />;
  } else if (showIntro) {
    screen = (
      <div className="stage-body">
        <p className="eyebrow">오늘 할 일 {tasks.length}개</p>
        <h1 className="hero-title">
          {auto.length}개는 제가 바로
          <br />
          끝낼 수 있어요
        </h1>
        <ul className="intro-list">
          {auto.map((t) => (
            <li key={t.id}>
              <t.icon size={18} aria-hidden="true" />
              <span>{t.headline}</span>
            </li>
          ))}
        </ul>
        <div className="stage-actions">
          <button
            type="button"
            className="btn btn-lg btn-primary"
            onClick={() => {
              started.current.clear();
              setBatch({ items: auto, step: 0 });
              setMode("batch");
            }}
          >
            <Sparkles size={18} aria-hidden="true" />
            <span>한 번에 끝내기</span>
          </button>
          <button type="button" className="btn btn-lg btn-ghost" onClick={() => setIntroDismissed(true)}>
            하나씩 할게요
          </button>
        </div>
        {askEntry}
      </div>
    );
  } else if (!current) {
    screen = (
      <div className="stage-body">
        <span className="done-mark done-mark-calm" aria-hidden="true">
          <Check size={40} strokeWidth={3} />
        </span>
        <h1 className="hero-title">오늘 할 거 다 했어요</h1>
        <p className="hero-sub">새로 생기면 여기에 바로 보여 드릴게요.</p>
        {askEntry}
      </div>
    );
  } else {
    const isWaiting = waiting?.id === current.id;
    const files = current.files ?? [];
    const pct = isWaiting
      ? Math.round((files.reduce((s, f) => s + (jobFor(jobs, f.id)?.progress ?? 0), 0) / files.length) * 100)
      : 0;
    screen = (
      <div className="stage-body" key={current.id}>
        <div className="pager">
          <span className="pager-count">
            {index + 1} / {tasks.length}
          </span>
          <button type="button" className="icon-btn" aria-label="이전 일" title="이전 일 (위 화살표)" disabled={tasks.length < 2} onClick={() => move(-1)}>
            <ArrowUp size={18} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" aria-label="다음 일" title="다음 일 (아래 화살표)" disabled={tasks.length < 2} onClick={() => move(1)}>
            <ArrowDown size={18} aria-hidden="true" />
          </button>
        </div>
        <CourseChip task={current} />
        <h1 className="hero-title">{current.headline}</h1>
        {current.detail && <p className="hero-sub">{current.detail}</p>}
        {current.summary && <Summary items={current.summary} />}
        <div className="stage-actions">
          <button type="button" className="btn btn-lg btn-primary" disabled={isWaiting} onClick={() => act(current)}>
            {isWaiting ? (
              <span>받는 중 {pct}%</span>
            ) : (
              <>
                <current.icon size={18} aria-hidden="true" />
                <span>{current.action}</span>
              </>
            )}
          </button>
          <button type="button" className="btn btn-lg btn-ghost" disabled={tasks.length < 2 || isWaiting} onClick={() => move(1)}>
            나중에 할게요
          </button>
        </div>
        {askEntry}
      </div>
    );
  }

  return (
    <div className="stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {screen}
    </div>
  );
}
