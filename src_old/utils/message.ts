
export function messageHasKeyword(message: string, keyword: string): boolean {
    if(!message.startsWith(keyword)) {
        return false;
    }

    // To remove instances of 'doThing' cmd and 'doThingAlt' both triggering 'doThing', require end or space after keyword
    if(message.charAt(keyword.length) !== '' && message.charAt(keyword.length) !== ' ') {
        return false;
    }

    return true;
} 