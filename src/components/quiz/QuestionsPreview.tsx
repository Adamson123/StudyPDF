import { Dispatch, SetStateAction, useState } from "react";
import Popup from "../ui/Popup";
import FillAnswerCard from "./FillAnswerCard";
import MultiChoiceCard from "./MultiChoiceCard";

const QuestionsPreview = ({
    questions,
    setStartQuiz,
}: {
    questions: (FillAnswerTypes | MultiChoiceQuestionTypes)[];
    setStartQuiz: Dispatch<SetStateAction<boolean>>;
}) => {
    const [showPopUp, setShowPopUp] = useState(false);
    return (
        <div className="mx-auto grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {questions.map((question, index) =>
                (question as MultiChoiceQuestionTypes).type ===
                "multiChoice" ? (
                    <MultiChoiceCard
                        key={index}
                        index={index}
                        setQuestions={() => {
                            setShowPopUp(true);
                        }}
                        setCurrentQuestion={() => {}}
                        numberOfQuestions={questions.length}
                        question={question as MultiChoiceQuestionTypes}
                    />
                ) : (
                    <FillAnswerCard
                        key={index}
                        setQuestions={() => {
                            setShowPopUp(true);
                        }}
                        question={question as FillAnswerTypes}
                        index={index}
                        setCurrentQuestion={() => {}}
                        numberOfQuestions={questions.length}
                    />
                ),
            )}
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
        </div>
    );
};

export default QuestionsPreview;
