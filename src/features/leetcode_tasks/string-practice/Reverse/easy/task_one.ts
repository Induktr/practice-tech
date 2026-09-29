const symbols = ["h","e","l","l","o"];

function reverseString(s: string[]): void {
    for (let left = 0, right = s.length - 1; left < right; left++, right--) {
        [s[left], s[right]] = [s[right], s[left]];
    }
}

reverseString(symbols);