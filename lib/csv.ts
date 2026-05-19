const REQUIRED_COLUMNS = [
  "subject",
  "chapter",
  "question_text",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "explanation",
  "difficulty",
];

type ParsedQuestion = {
  subject: string;
  chapter: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

function rows(text: string) {
  const output: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  text = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index++;
      }
      row.push(cell);
      output.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    output.push(row);
  }

  return output.filter((items) => items.some((item) => item.trim()));
}

export function parseQuestionCsv(text: string) {
  const allRows = rows(text);
  const headers = (allRows.shift() || []).map((item) => item.trim().toLowerCase());
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));

  if (missingColumns.length) {
    return {
      questions: [] as ParsedQuestion[],
      errors: [`Missing columns: ${missingColumns.join(", ")}`],
    };
  }

  const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));
  const questions: ParsedQuestion[] = [];
  const errors: string[] = [];
  const optionMap: Record<string, ParsedQuestion["correct_option"]> = {
    "\u0995": "A",
    "\u0996": "B",
    "\u0997": "C",
    "\u0998": "D",
  };

  allRows.forEach((row, index) => {
    const getValue = (key: string) => String(row[headerIndex[key]] ?? "").trim();
    const correctOption =
      optionMap[getValue("correct_option")] ||
      (getValue("correct_option").toUpperCase() as ParsedQuestion["correct_option"]);
    const emptyFields = [
      "subject",
      "chapter",
      "question_text",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_option",
    ].filter((field) => !getValue(field));

    if (emptyFields.length) {
      errors.push(`Row ${index + 2}: ${emptyFields.join(", ")} empty`);
      return;
    }

    if (!["A", "B", "C", "D"].includes(correctOption)) {
      errors.push(`Row ${index + 2}: correct_option invalid`);
      return;
    }

    const rawDifficulty = getValue("difficulty");
    const difficulty =
      rawDifficulty === "Medium" || rawDifficulty === "Hard" ? rawDifficulty : "Easy";

    questions.push({
      subject: getValue("subject"),
      chapter: getValue("chapter"),
      question_text: getValue("question_text"),
      option_a: getValue("option_a"),
      option_b: getValue("option_b"),
      option_c: getValue("option_c"),
      option_d: getValue("option_d"),
      correct_option: correctOption,
      explanation: getValue("explanation"),
      difficulty,
    });
  });

  return { questions, errors };
}
