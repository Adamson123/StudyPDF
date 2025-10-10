//A function to handle randomizing an array
export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

//Shuffle a particular data position in an array
export const shuffleDataPositionInArray = (
    array: any[],
    indexToShuffle: number,
) => {
    const newArray = [...array];
    const element = newArray.splice(indexToShuffle, 1)[0];
    const randomIndex = Math.floor(Math.random() * (newArray.length + 1));
    // console.log(randomIndex, element);

    newArray.splice(randomIndex, 0, element);
    //   console.log(newArray);

    return newArray;
};
