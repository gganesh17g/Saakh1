import { useLocation, useSearchParams } from "react-router-dom";
import { useBusiness } from "./store";
import { useWorkspace4 } from "./workspace4";
/** URL is authoritative for Back/Forward; preferences restore a module's last view. */
export function useView4(
  key: string,
  fallback: string,
): [string, (value: string) => void] {
  const { data: s } = useBusiness(),
    w = useWorkspace4();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const storageKey = `view:${s.activeBusiness}:${s.role}:${location.pathname}:${key}`;
  return [
    params.get(key) ?? w.data.prefs[storageKey] ?? fallback,
    (value: string) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set(key, value);
          return next;
        },
        { replace: true },
      );
      void w.write((d) => {
        d.prefs[storageKey] = value;
      });
    },
  ];
}
