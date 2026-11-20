// Practice Object and not only { key: value } and more deeply correction conceptions.

// Example 1:
// Description: Demonstrating the creation and manipulation of objects in JavaScript on example with user data, for migration purposes and rules.

// const user = {
//   id: 1,
//   name: "John Doe",
//   email: "john.doe@example.com",
//   age: 30,
//   address: {
//     street: "123 Main St",
//     city: "Anytown",
//     state: "CA",
//     zip: "12345"
//   },
//   createdAt: Date.now(),
//   updatedAt: Date.now()
// };

// const PERMISSIONS_USER = {
//   permissions: {
//     read: true,
//     write: false,
//     delete: false
//   }
// };

// const addPermissions = Object.assign(user, PERMISSIONS_USER);

// function styleTerminal() {
//   function generateLines(length = 50, char = '-', appendNewLine = true, isWordTrim = true) {
//     const line = char.repeat(length);
//     return appendNewLine ? isWordTrim ? `${line}\n\n` : `${line}\n` : line;
//   };

//   return { generateLines };
// };

// const { generateLines } = styleTerminal();

// let isMutationUser = false;
// Object.keys(addPermissions).forEach((key) => addPermissions[key] !== user[key] ? isMutationUser = false : isMutationUser = true);

// console.log(generateLines(), `${JSON.stringify(user)}${isMutationUser}`, generateLines());

// Example 2:
// Description: Demonstrating the use of Object.assign() to merge properties from multiple objects, for migration purposes, and on the scenario we create target the portfolio projects with array/objects.

// const portfolioProjects = [
//   {
//     id: 1,
//     title: "IBIOPTICS",
//     author: "Andrey Daronychev",
//     description: "A cutting-edge optical device for medical applications.",
//     tags: ["Optical", "Medical"],
//   },
//   {
//     id: 2,
//     title: "WestBud",
//     author: "Illya Klymov",
//     description: "A modern web application for demo portfolio projects of aspects construction build complexity life",
//     tags: [
//       "Web",
//       "Application",
//       "Build",
//       "Construction",
//       "Life",
//       "Complexity"
//     ],
//   },
//   {
//     id: 3,
//     title: "IBIOPTICS",
//     author: "Andrey Daronychev",
//     description: "A cutting-edge optical device for medical applications.",
//     tags: ["Optical", "Medical"],
//   }
// ];

// const migrationPortfolio = {
//   images: [
//     {
//       id: 1,
//       src: "image1.jpg",
//       alt: "Image 1",
//       width: 800,
//       height: 600
//     },
//     {
//       id: 2,
//       src: "image2.jpg",
//       alt: "Image 2",
//       width: 800,
//       height: 600
//     },
//     {
//       id: 3,
//       src: "image3.jpg",
//       alt: "Image 3",
//       width: 800,
//       height: 600
//     },
//     {
//       id: 4,
//       src: "image4.jpg",
//       alt: "Image 4",
//       width: 800,
//       height: 600
//     },
//     {
//       id: 5,
//       src: "image5.jpg",
//       alt: "Image 5",
//       width: 800,
//       height: 600
//     },
//   ],
//   createdAt: Date.now(),
//   updatedAt: Date.now()
// }

// portfolioProjects.map((project) => {
//   const updatedProject = Object.assign(project, migrationPortfolio);

//   console.log(updatedProject);
// });

// Example 3:
// Description: Organization of documentation specification, and more rules for implemenation managment, and profecency using Object.assign() for migration documennt adding new fileds, and rules.

// const userTable = {
//   id: "4x039L)1-xcPWz",
//   name: "users",
//   columns: ["id", "name", "email", "created_at", "updated_at"],
//   types: ["TEXT", "TEXT", "TEXT", "DATETIME", "DATETIME"]
// };

// const MIGRATIONS = {
//   permissions: {
//     read: true,
//     write: true,
//     delete: true
//   },
//   bio: "I am a software developer."
// };

// let objColumn = {};

// userTable.columns.forEach((col, index) => objColumn[col] = userTable.types[index];);

// Object.assign(objColumn, MIGRATIONS);

// console.log(objColumn);

// Example 4:
// Description: 2D Engine, for Animations Vectors Lines & any more objects.

const DEFAULT_COOR = {
  i: {
    x: 1,
    y: 0
  },
  j: {
    x: 0,
    y: 1
  }
};

function generateRandomCoord() {
  return {
    i: {
      x: Math.floor(Math.random() * 10) / 10,
      y: Math.floor(Math.random() * 10) / 10
    },
    j: {
      x: Math.floor(Math.random() * 10) / 10,
      y: Math.floor(Math.random() * 10) / 10
    }
  };
}

function step(node, fromCoord) {
  const toCoord = generateRandomCoord();

  const animation = node.animate([
    { transform: `matrix(${fromCoord.i.x}, ${fromCoord.i.y}, ${fromCoord.j.x}, ${fromCoord.j.y}, ${fromCoord.i.x}, ${fromCoord.i.y})` },
    { transform: `matrix(${toCoord.i.x}, ${toCoord.i.y}, ${toCoord.j.x}, ${toCoord.j.y}, 100, 0)` },
  ], {
    duration: 1000,
    fill: "forwards"
  });

  animation.onfinish = () => {
    animation.commitStyles();
    animation.cancel();
    step(node, toCoord);
  };
}

const divEl = document.querySelector('.div-trigger');

step(divEl, DEFAULT_COOR);

// TODO: Create Panel for choosing variations animations demo transform vector on using linear algebra.

// const chooseCard = document.querySelectorAll(".card__choose-animation");

// chooseCard.forEach((card, index) => {
//   let unionAnimations = ["Scale", "Rotate", "Translate", "Skew"]
//   if(unionAnimations[index] === "Scale") {
//     card.classList.add("active")
//   }
//   card.addEventListener("click", () => {
//     card.classList.add("active")

//     if(unionAnimations[index] === "Scale") {
//       card.classList.remove("active")
//     }
//   })
// })
