const validateStudyMaterial = (items: any[], type: string) => {
    if (!items.length) return false;
    // Basic validation based on type
    switch (type) {
        case "Quizzes":
            return items.every(
                (item) =>
                    //  item.title &&
                    item.id &&
                    item.questions &&
                    Array.isArray(item.questions) &&
                    item.questions?.every((q: any) => {
                        let isMultipleChoiceValid = true;
                        if (q.type === "multichoice") {
                            isMultipleChoiceValid =
                                q.options && Array.isArray(q.options);
                        }
                        return (
                            isMultipleChoiceValid &&
                            q.question &&
                            typeof q.answer !== "undefined"
                        );
                    }),
            );
        case "Flashcards":
            return items.every(
                (item) =>
                    // item.title &&
                    item.id &&
                    Array.isArray(item.cards) &&
                    item.cards.every((f: any) => f.front && f.back),
            );
        case "Summaries":
            return items.every(
                (
                    item, //item.title &&
                ) => item.id && item.content,
            );
        default:
            return false;
    }
};

export default validateStudyMaterial;
