
function roll(min: number, max: number) {
    if(isNaN(min)) {
        throw new Error('min is not a number');
    }

    if(isNaN(max)) {
        throw new Error('max is not a number');
    }

    if(min > max) {
        throw new Error(`min value: ${min} is bigger than max value: ${max}`);
    }

    if(min < 0 || max < 0) {
        throw new Error('Value cannot be negative');
    }

    min = Math.floor(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

function pickRandom<T>(list: T[]): undefined | T {
    if(list.length === 0) {
        return;
    }

    return list[Math.floor(Math.random() * (list.length))];
}

// Randomize
function shuffle<T>(list: T[]): T[] {
    // Don't modify original array
    const shuffledArray = Array.from(list);

    let currentIndex: number = list.length;
    let temporaryValue: T;
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = shuffledArray[currentIndex];
      shuffledArray[currentIndex] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temporaryValue;
    }

    return shuffledArray;
}


export { roll, pickRandom, shuffle };