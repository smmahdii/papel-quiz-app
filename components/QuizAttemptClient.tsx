"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bnNumber } from "@/lib/utils";

type QuizAttemptClientProps = {
  quiz: any;
  questions: any[];
};

export function QuizAttemptClient({ quiz, questions }: QuizAttemptClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState((quiz.time_limit_minutes || 40) * 60);
  const [loading, setLoading] = useState(false);

  const answersRef = useRef(answers);
  const secondsRef = useRef(seconds);
  const loadingRef = useRef(loading);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const answered = Object.keys(answers).length;
  const progress = useMemo(
    () => (questions.length ? Math.round((answered / questions.length) * 100) : 0),
    [answered, questions.length],
  );

  const submit = useCallback(
    async (auto = false) => {
      if (loadingRef.current) {
        return;
      }

      if (!auto && !confirm("Submit this quiz?")) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);

      const timeLimitSeconds = (quiz.time_limit_minutes || 40) * 60;
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: answersRef.current,
          timeTakenSeconds: timeLimitSeconds - secondsRef.current,
        }),
      });
      const data = await response.json();

      if (response.status === 401) {
        alert("Your session expired. Please enter your student information again, then submit.");
        loadingRef.current = false;
        setLoading(false);
        router.push("/?error=session");
        return;
      }

      if (!response.ok) {
        alert(data.error || "Submit failed");
        loadingRef.current = false;
        setLoading(false);
        return;
      }

      router.push(`/student/result/${data.attemptId}`);
    },
    [quiz.id, quiz.time_limit_minutes, router],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearInterval(timer);
          void submit(true);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submit]);

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-6xl">
      <section className="hero">
        <h1 className="text-3xl font-black">{quiz.title}</h1>
        <p className="mt-2 text-blue-100">Admission Battle Mode</p>
      </section>

      <div className="sticky top-[74px] z-30 my-5 rounded-3xl border border-blue-100 bg-white/95 p-4 shadow-premium">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <b>
              Answered: {bnNumber(answered)} / {bnNumber(questions.length)}
            </b>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full bg-gradient-to-r from-papel-blue to-papel-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div
            className={`rounded-2xl px-5 py-3 text-center font-black text-white ${
              seconds <= 300 ? "bg-red-600" : "bg-slate-900"
            }`}
          >
            {bnNumber(timer)}
          </div>

          <button
            onClick={() => submit(false)}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-br from-papel-gold to-orange-400 px-6 py-4 font-black text-slate-900"
          >
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <article
            key={question.id}
            className="overflow-hidden rounded-[1.7rem] border border-blue-100 bg-white shadow-premium"
          >
            <div className="border-b border-blue-50 bg-blue-50 p-5">
              <div className="mb-2 font-black text-papel-blue">
                {bnNumber(index + 1)} - {question.subject} - {question.chapter}
              </div>
              <h2 className="text-lg font-black leading-relaxed">{question.question_text}</h2>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {[
                ["A", question.option_a],
                ["B", question.option_b],
                ["C", question.option_c],
                ["D", question.option_d],
              ].map(([key, text]) => (
                <label
                  key={key}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-4 font-bold ${
                    answers[question.id] === key
                      ? "border-papel-blue bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    className="hidden"
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === key}
                    onChange={() =>
                      setAnswers((currentAnswers) => ({
                        ...currentAnswers,
                        [question.id]: key,
                      }))
                    }
                  />
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-black ${
                      answers[question.id] === key
                        ? "bg-papel-blue text-white"
                        : "bg-blue-50 text-papel-blue"
                    }`}
                  >
                    {key}
                  </span>
                  <span>{text}</span>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
