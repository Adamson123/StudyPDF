import { Dispatch, SetStateAction, useState } from "react";
import Popup from "../ui/Popup";
import FillAnswerCard from "./FillAnswerCard";
import MultiChoiceCard from "./MultiChoiceCard";
import DefinitionCard from "./DefinitionCard";

const getAnswerText = (question: QuizTypes) => {
    if ((question as MultiChoiceQuestionTypes).type === "multiChoice") {
        const multipleChoiceQuestion = question as MultiChoiceQuestionTypes;
        const answerIndex = ["A", "B", "C", "D"].indexOf(
            multipleChoiceQuestion.answer,
        );

        return `${multipleChoiceQuestion.answer}. ${multipleChoiceQuestion.options[answerIndex] || ""}`;
    }

    if ((question as DefinitionQuestionTypes).type === "definition") {
        return (question as DefinitionQuestionTypes).answer;
    }

    return (question as FillAnswerTypes).answer.join(", ");
};

const QuestionsPreview = ({
    questions,
    setStartQuiz,
}: {
    questions: QuizTypes[];
    setStartQuiz: Dispatch<SetStateAction<boolean>>;
}) => {
    const [showPopUp, setShowPopUp] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);

    return (
        <>
            <label className="mx-auto flex w-full max-w-[600px] cursor-pointer items-center gap-2 rounded-md border border-gray-border p-3 text-sm">
                <input
                    type="checkbox"
                    checked={showAnswers}
                    onChange={(event) => setShowAnswers(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                />
                Show answers
            </label>

            <div className="mx-auto grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {questions.map((question, index) => (
                    <div key={index} className="flex flex-col gap-3">
                        {(question as MultiChoiceQuestionTypes).type ===
                        "multiChoice" ? (
                            <MultiChoiceCard
                                index={index}
                                setQuestions={() => {
                                    setShowPopUp(true);
                                }}
                                setCurrentQuestion={() => {}}
                                numberOfQuestions={questions.length}
                                question={question as MultiChoiceQuestionTypes}
                            />
                        ) : (question as DefinitionQuestionTypes).type ===
                          "definition" ? (
                            <DefinitionCard
                                setQuestions={() => {
                                    setShowPopUp(true);
                                }}
                                question={question as DefinitionQuestionTypes}
                                index={index}
                                setCurrentQuestion={() => {}}
                                numberOfQuestions={questions.length}
                            />
                        ) : (
                            <FillAnswerCard
                                setQuestions={() => {
                                    setShowPopUp(true);
                                }}
                                question={question as FillAnswerTypes}
                                index={index}
                                setCurrentQuestion={() => {}}
                                numberOfQuestions={questions.length}
                            />
                        )}

                        {showAnswers && (
                            <div className="max-w-[600px] rounded-md border border-green-500/40 bg-green-500/10 p-3 text-sm">
                                <strong>Answer: </strong>
                                {getAnswerText(question)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showPopUp && (
                <Popup
                    executeBtnLabel="Start"
                    message="Do you want to start the quiz"
                    cancelBtnFunc={() => setShowPopUp(false)}
                    executeBtnFunc={() => {
                        setShowPopUp(false);
                        setStartQuiz(true);
                    }}
                />
            )}
        </>
    );
};

export default QuestionsPreview;
