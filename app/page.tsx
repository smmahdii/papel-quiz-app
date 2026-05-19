import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { setStudentId } from "@/lib/auth";
import { validBdPhone } from "@/lib/utils";

async function enterStudent(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const admission_roll = String(formData.get("admission_roll") || "").trim();
  const batch_no = String(formData.get("batch_no") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !admission_roll || !batch_no || !phone) redirect("/?error=missing");
  if (!validBdPhone(phone)) redirect("/?error=phone");

  const sb = supabaseAdmin();
  const ex = await sb.from("profiles").select("id").eq("phone", phone).eq("role", "student").maybeSingle();

  let id = ex.data?.id;
  if (id) {
    await sb.from("profiles").update({ name, admission_roll, batch_no, status: "active" }).eq("id", id);
  } else {
    const ins = await sb.from("profiles").insert({
      name, admission_roll, batch_no, phone, role: "student", status: "active"
    }).select("id").single();
    if (ins.error) throw new Error(ins.error.message);
    id = ins.data.id;
  }

  setStudentId(id);
  redirect("/student/dashboard");
}

export default function Home({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen px-4 py-8 md:py-14">
      <section className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#021b3a] via-[#004a99] to-cyan-500 p-8 text-white shadow-2xl">
          <div className="mb-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-black">
            Papel Edu-Care • Sign of Faith!
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Diploma Admission <span className="text-[#ffd700]">Battle</span>
          </h1>
          <p className="mt-5 text-lg text-blue-50">
            কুইজ দাও, স্কোর দেখো, নিজের প্রস্তুতির আসল অবস্থান বুঝে নাও।
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/15 p-4"><b>MCQ</b><br/>Test</div>
            <div className="rounded-2xl bg-white/15 p-4"><b>Live</b><br/>Result</div>
            <div className="rounded-2xl bg-white/15 p-4"><b>Rank</b><br/>Board</div>
          </div>
        </div>

        <form action={enterStudent} className="card">
          <h2 className="text-3xl font-black text-[#022f61]">Student Entry</h2>
          <p className="mt-2 text-slate-500">তথ্য দিন, সরাসরি Dashboard-এ প্রবেশ করুন।</p>

          {searchParams.error && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-600">
              তথ্য সঠিকভাবে পূরণ করুন। মোবাইল নম্বর 01 দিয়ে ১১ ডিজিট হতে হবে।
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label>শিক্ষার্থীর নাম</label>
              <input name="name" placeholder="আপনার নাম" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label>ভর্তি রোল</label>
                <input name="admission_roll" placeholder="Admission Roll" />
              </div>
              <div>
                <label>ব্যাচ নং</label>
                <input name="batch_no" placeholder="Batch No" />
              </div>
            </div>
            <div>
              <label>মোবাইল নম্বর</label>
              <input name="phone" placeholder="01XXXXXXXXX" />
            </div>
            <button className="btn-primary w-full text-lg">Dashboard এ প্রবেশ করুন</button>
          </div>
        </form>
      </section>
    </main>
  );
}
