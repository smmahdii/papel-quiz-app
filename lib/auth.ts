import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const STUDENT_COOKIE = "papel_student_id";
export const ADMIN_COOKIE = "papel_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 6;

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function getStudentId() {
  return cookies().get(STUDENT_COOKIE)?.value ?? null;
}

export function requireStudentId() {
  const id = getStudentId();

  if (!id) {
    redirect("/");
  }

  return id;
}

export function setStudentId(id: string) {
  cookies().set(STUDENT_COOKIE, id, sessionCookieOptions());
}

export function clearStudentId() {
  cookies().delete(STUDENT_COOKIE);
}

export function setAdminSession() {
  cookies().set(
    ADMIN_COOKIE,
    process.env.ADMIN_SESSION_TOKEN || "dev-admin-session",
    sessionCookieOptions(),
  );
}

export function requireAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN || "dev-admin-session";

  if (!token || token !== expectedToken) {
    redirect("/admin/login");
  }
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE);
}
