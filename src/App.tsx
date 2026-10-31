import { useEffect, useRef } from "react";
import { CommandBar } from "./components/CommandBar";
import { DownloadTray } from "./components/DownloadTray";
import { Sidebar, TabBar } from "./components/Nav";
import { Toast } from "./components/Toast";
import { useRoute, type Route } from "./router";
import { Course } from "./screens/Course";
import { Courses } from "./screens/Courses";
import { Schedule } from "./screens/Schedule";
import { Settings } from "./screens/Settings";
import { Today } from "./screens/Today";

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case "today":
      return <Today />;
    case "courses":
      return <Courses />;
    case "course":
      return <Course id={route.id} />;
    case "schedule":
      return <Schedule />;
    case "settings":
      return <Settings />;
  }
}

export default function App() {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  const key = route.name === "course" ? `course-${route.id}` : route.name;

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [key]);

  return (
    <div className="app">
      <Sidebar route={route} />
      <main className="main" ref={mainRef}>
        <div className="topbar">
          <CommandBar />
        </div>
        <Screen key={key} route={route} />
      </main>
      <TabBar route={route} />
      <DownloadTray />
      <Toast />
    </div>
  );
}
