import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, ArrowRight, ChevronLeft } from "lucide-react";
const steps = [
  {
    route: "/app",
    target: ".context-bar",
    title: "Meet the business",
    text: "Select Anjali Foods and run the simulation. Click a score factor to inspect its formula and contribution.",
  },
  {
    route: "/app/generate",
    target: ".form-grid",
    title: "Change the financial twin",
    text: "Try a collection delay of 60 days. Run the same engines again or capture a parallel scenario.",
  },
  {
    route: "/app/verify",
    target: ".evidence-chain",
    title: "Follow the evidence",
    text: "Select an invoice relationship. Follow its record and document an unresolved question in the review workbench.",
  },
  {
    route: "/app/attack",
    target: ".attack-grid",
    title: "Stress the assumptions",
    text: "Run Circular Invoicing and Seasonal Shock. Inspect their actual evidence and baseline differences.",
  },
  {
    route: "/app/impact",
    target: ".impact-hero",
    title: "Explain the economics",
    text: "Change the lender assumptions. Then open Reports to export your actual run and its input snapshot.",
  },
];
export default function StoryTour() {
  const [active, setActive] = useState(
    window.localStorage.getItem("saakh-tour-active") === "1",
  );
  const [step, setStep] = useState(
    Math.max(
      0,
      Math.min(4, Number(window.localStorage.getItem("saakh-tour-step")) || 0),
    ),
  );
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const start = () => {
      setStep(0);
      setActive(true);
      navigate("/app");
    };
    window.addEventListener("saakh-start-tour", start);
    return () => window.removeEventListener("saakh-start-tour", start);
  }, [navigate]);
  useEffect(() => {
    window.localStorage.setItem("saakh-tour-active", active ? "1" : "0");
    window.localStorage.setItem("saakh-tour-step", String(step));
    if (!active) return;
    let node: Element | null = null;
    const timer = setTimeout(() => {
      node = document.querySelector(steps[step].target);
      node?.classList.add("tour-target");
    }, 350);
    return () => {
      clearTimeout(timer);
      node?.classList.remove("tour-target");
    };
  }, [active, step, location.pathname]);
  if (!active) return null;
  const go = (next: number) => {
    setStep(next);
    navigate(steps[next].route);
  };
  return (
    <aside className="story-tour" aria-label="Interactive story mode">
      <div className="eyebrow">
        STORY MODE · {step + 1} / 5{" "}
        <button aria-label="Close story mode" onClick={() => setActive(false)}>
          <X size={16} />
        </button>
      </div>
      <h2>{steps[step].title}</h2>
      <p>{steps[step].text}</p>
      <div className="actions">
        <button
          className="icon-btn"
          disabled={!step}
          aria-label="Previous story checkpoint"
          onClick={() => go(step - 1)}
        >
          <ChevronLeft size={17} />
        </button>
        <button className="text-link" onClick={() => setActive(false)}>
          Skip tour
        </button>
        <button
          className="button small"
          onClick={() => (step === 4 ? setActive(false) : go(step + 1))}
        >
          {step === 4 ? "Finish tour" : "Next checkpoint"}
          <ArrowRight size={13} />
        </button>
      </div>
      <small>
        Interact with the live workspace at each checkpoint. About 3–5 minutes.
      </small>
    </aside>
  );
}
