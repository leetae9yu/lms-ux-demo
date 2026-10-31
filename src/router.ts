import { useEffect, useState } from "react";
import { courses, type CourseId } from "./data";

export type Route =
  | { name: "today" }
  | { name: "courses" }
  | { name: "course"; id: CourseId }
  | { name: "schedule" }
  | { name: "settings" };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/");
  switch (parts[0]) {
    case "courses":
      return { name: "courses" };
    case "course": {
      const course = courses.find((c) => c.id === parts[1]);
      return course ? { name: "course", id: course.id } : { name: "courses" };
    }
    case "schedule":
      return { name: "schedule" };
    case "settings":
      return { name: "settings" };
    default:
      return { name: "today" };
  }
}

export function href(route: Route): string {
  return route.name === "course" ? `#/course/${route.id}` : `#/${route.name}`;
}

export function navigate(route: Route): void {
  window.location.hash = href(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
