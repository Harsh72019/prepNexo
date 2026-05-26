"use client";

import { useParams } from "next/navigation";
import { QuestionPracticeClient } from "@/components/questions/question-practice-client";

export default function QuestionPracticePage() {
  const params = useParams<{ questionId: string }>();
  return <QuestionPracticeClient questionId={params.questionId} />;
}
