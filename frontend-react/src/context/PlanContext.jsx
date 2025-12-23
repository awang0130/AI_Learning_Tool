import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PlanContext = createContext(null);

const STORAGE_KEY = "ai_learning_plan_v1";

const defaultState = {
  plan: [],
  topic: "",
  level: "beginner",
  minutes: 30,
  goal: "",
  formats: ["video", "reading"],
  createdAt: null,
  progress: {},
};

function safeParse(json) {
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function PlanProvider({ children }) {
  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    return parsed ? { ...defaultState, ...parsed } : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actions = useMemo(
    () => ({
      setPlan(payload) {
        setState((prev) => ({
          ...prev,
          ...payload,
          createdAt: new Date().toISOString(),
          progress: {},
        }));
      },

      clearPlan() {
        setState(defaultState);
      },

      toggleDayComplete(dayNumber) {
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            [dayNumber]: !prev.progress?.[dayNumber],
          },
        }));
      },
    }),
    []
  );

  return (
    <PlanContext.Provider value={{ state, actions }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used inside <PlanProvider>");
  }
  return ctx;
}
