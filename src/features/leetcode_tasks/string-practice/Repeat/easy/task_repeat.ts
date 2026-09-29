function reverseStr(s: string = "abcdefg", k: number = 2): string {
  const a: string[] = s.split('');

  for (let i = 0; i < a.length; i += 2 * k) {
    let left = i;
    let right = Math.min(i + k - 1, a.length - 1);

    while (left < right) {
      [a[left], a[right]] = [a[right], a[left]];
      left++;
      right--;
    }
  };

  return a.join('');
};

console.log(reverseStr());