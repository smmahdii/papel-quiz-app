import { NextResponse } from "next/server";
import { getStudentId, sessionCookieOptions, STUDENT_COOKIE } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { calculateScore, getQuizStatus } from "@/lib/quiz";

function jsonWithStudentSession(body: unknown, studentId: string, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.cookies.set(STUDENT_COOKIE, studentId, sessionCookieOptions());
  return response;
}

export async function POST(req: Request) {
  const studentId = getStudentId();

  if (!studentId) {
    return NextResponse.json({ error: "Student session missing" }, { status: 401 });
  }

  const body = await req.json();
  const sb = supabaseAdmin();
  const { data: quiz } = await sb.from("quizzes").select("*").eq("id", body.quizId).single();

  if (!quiz || getQuizStatus(quiz) !== "available") {
    return jsonWithStudentSession({ error: "Quiz not available" }, studentId, { status: 403 });
  }

  const { data: oldAttempt } = await sb
    .from("attempts")
    .select("id")
    .eq("quiz_id", quiz.id)
    .eq("student_id", studentId)
    .maybeSingle();

  if (oldAttempt) {
    return jsonWithStudentSession({ attemptId: oldAttempt.id }, studentId);
  }

  const { data: questions } = await sb
    .from("questions")
    .select("id,correct_option")
    .eq("quiz_id", quiz.id);
  const calculation = calculateScore(questions || [], body.answers || {}, quiz);
  const { data: attempt, error } = await sb
    .from("attempts")
    .insert({
      quiz_id: quiz.id,
      student_id: studentId,
      submitted_at: new Date().toISOString(),
      score: calculation.score,
      total_marks: calculation.totalMarks,
      correct_count: calculation.correct,
      wrong_count: calculation.wrong,
      unanswered_count: calculation.unanswered,
      time_taken_seconds: Math.max(1, Number(body.timeTakenSeconds || 0)),
      status: "submitted",
    })
    .select("id")
    .single();

  if (error) {
    return jsonWithStudentSession({ error: error.message }, studentId, { status: 500 });
  }

  const answerRows = (questions || []).map((question: any) => {
    const selectedOption = (body.answers || {})[question.id] || null;
    const isCorrect = selectedOption === question.correct_option;

    return {
      attempt_id: attempt.id,
      question_id: question.id,
      selected_option: selectedOption,
      is_correct: isCorrect,
      marks_obtained: !selectedOption
        ? 0
        : isCorrect
          ? Number(quiz.marks_per_question || 1)
          : -Number(quiz.negative_mark || 0),
    };
  });

  if (answerRows.length) {
    await sb.from("student_answers").insert(answerRows);
  }

  return jsonWithStudentSession({ attemptId: attempt.id }, studentId);
}
