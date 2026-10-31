import { Check, X } from "lucide-react";
import { useStore } from "../store";

export function DownloadTray() {
  const { jobs, cancelDownloads, clearDownloads } = useStore();
  const live = jobs.filter((j) => j.state !== "canceled");
  if (live.length === 0) return null;
  const done = live.filter((j) => j.state === "done").length;
  const running = done < live.length;
  const total = live.reduce((sum, j) => sum + j.file.sizeMB, 0);
  const got = live.reduce((sum, j) => sum + j.file.sizeMB * j.progress, 0);
  const pct = Math.round((got / total) * 100);
  const current = live.filter((j) => j.state === "active").map((j) => j.file.name);
  return (
    <aside className="tray" aria-label="자료 받기 진행">
      <div className="tray-head">
        {running ? (
          <p className="tray-title">
            자료 받는 중 <span className="tray-count">{done}/{live.length}</span>
          </p>
        ) : (
          <p className="tray-title">
            <Check size={16} aria-hidden="true" className="tray-ok" />
            자료 {live.length}개를 받았어요
          </p>
        )}
        {running ? (
          <button type="button" className="btn btn-quiet btn-sm" onClick={cancelDownloads}>
            취소
          </button>
        ) : (
          <button type="button" className="icon-btn" aria-label="닫기" title="닫기" onClick={clearDownloads}>
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="전체 진행률">
        <div className="bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <p className="tray-sub">{running ? current.join(", ") || "대기 중" : "다운로드 폴더의 과목별 폴더에 저장했어요"}</p>
    </aside>
  );
}
