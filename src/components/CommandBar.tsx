import { CornerDownLeft, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { interpret, type Outcome } from "../commands";
import { suggestions } from "../data";
import { navigate } from "../router";
import { useStore } from "../store";
import { ResultCard } from "./ResultCard";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Fired by suggestion chips outside the bar so one click runs a sentence. */
export const RUN_EVENT = "run-command";

export function runCommand(text: string) {
  window.dispatchEvent(new CustomEvent<string>(RUN_EVENT, { detail: text }));
}

export function CommandBar() {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  const run = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const s = storeRef.current;
    const result = interpret(trimmed, { watched: s.watched, read: s.read, downloaded: s.downloaded });
    setQuery(trimmed);
    setOpen(true);
    setOutcome(result);
    if (result.kind === "download") s.download(result.files);
    if (result.kind === "theme") s.setTheme(result.theme);
    if (result.kind === "navigate") {
      navigate(result.route);
      setOpen(false);
      s.showToast(result.title);
    }
  };
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    const onRun = (e: Event) => {
      runRef.current((e as CustomEvent<string>).detail);
      inputRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(RUN_EVENT, onRun);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(RUN_EVENT, onRun);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(query);
  };

  const close = () => {
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="command" ref={boxRef} onKeyDown={(e) => e.key === "Escape" && close()}>
      <form className="command-form" role="search" onSubmit={submit}>
        <Search className="command-icon" size={18} aria-hidden="true" />
        <label htmlFor="command-input" className="sr-only">
          문장으로 명령하기
        </label>
        <input
          id="command-input"
          ref={inputRef}
          className="command-input"
          type="text"
          autoComplete="off"
          enterKeyHint="go"
          placeholder="무엇을 할까요? 예: 이번 주 마감 뭐 있어"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) setOutcome(null);
          }}
          onFocus={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="command-panel"
        />
        {query ? (
          <button
            type="button"
            className="icon-btn"
            aria-label="입력 지우기"
            title="입력 지우기"
            onClick={() => {
              setQuery("");
              setOutcome(null);
              inputRef.current?.focus();
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : (
          <kbd className="kbd" aria-hidden="true">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        )}
      </form>
      {open && (
        <div className="command-panel" id="command-panel">
          {outcome && <ResultCard outcome={outcome} />}
          <div className="panel-section">
            <p className="panel-label">{outcome ? "이어서 물어보기" : "이렇게 말해 보세요"}</p>
            <ul className="suggest-list">
              {suggestions.map((s) => (
                <li key={s}>
                  <button type="button" className="suggest" onClick={() => run(s)}>
                    <span>{s}</span>
                    <CornerDownLeft size={14} aria-hidden="true" className="suggest-enter" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
