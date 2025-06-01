"use server";

import { questionPrompts } from "@/data/static-data/questionPrompts";
import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

const generateQuestion = async (
  docBuffer: ArrayBuffer,
  questionType: string,
) => {
  const prompt = questionPrompts[questionType] || questionPrompts.mixed;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(docBuffer).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      prompt +
        `When it come's to Maths like subject or topic or texts, calculation question should take up 75% of the questions and the rest 30% should be normal questions.` +
        `- Overall questions amount should not be more than 50`,
    ]);

    const cleanJson = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");

    console.log(cleanJson);

    let parsedJSON: (FillAnswerTypes | MultiChoiceQuestionTypes)[] = [];
    if (cleanJson) {
      parsedJSON = JSON.parse(cleanJson) as (
        | FillAnswerTypes
        | MultiChoiceQuestionTypes
      )[];
      //randomize the order of multiChoice answers
      const optionsAlp = ["A", "B", "C", "D"];
      //TODO:  Add randomize the order of multiChoice answers
      // parsedJSON.forEach((question) => {
      //   if (question.type === "multiChoice") {
      //     const options = (question as any).options;
      //     const correctAnswerIndex = optionsAlp.indexOf(
      //       question.answer as string,
      //     );
      //     const correctAnswerLetter = options[correctAnswerIndex];
      //     //  const correctIndex = options.indexOf(correctAnswer);

      //     options.splice(correctAnswerIndex, 1);
      //     options.sort(() => Math.random() - 0.5);
      //     options.splice(correctAnswerIndex, 0, correctAnswerLetter);
      //   }
      // });
      // return JSON.parse(cleanJson);
    }

    return parsedJSON;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export default generateQuestion;
