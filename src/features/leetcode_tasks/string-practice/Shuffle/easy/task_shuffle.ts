// 1 Example
function restoreString(s: string = "codeleet", indices: number[] = [4,5,6,7,0,2,1,3]): string {
  const spliting = s.split("");
  
  let result: string[] = [];

  for(let i = 0; i < spliting.length; i++) { result[indices[i]] = spliting[i] };

  return result.join("");
};

// 2 Example
// function restoreString(s: string = "codeleet", indices: number[] = [4,5,6,7,0,2,1,3]): string {
//   const spliting = s.split("");
  
//   let result: string[] = [];

//   let index = 0;

//   while(spliting.length > index) {
//     result[indices[index]] = spliting[index];
//     index++;
//   };

//   return result.join("");
// };