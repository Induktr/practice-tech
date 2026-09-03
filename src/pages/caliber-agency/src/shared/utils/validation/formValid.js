export function validationForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const inputs = form.querySelectorAll(".form-input");
  const textarea = form.querySelector(".form-textarea");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    inputs.forEach((input) => {
      const errorMsg = input.parentElement.querySelector(".error-message");
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = "rgb(255, 76, 76)";
        input.style.color = "rgb(255, 76, 76)";
        if (errorMsg) errorMsg.textContent = input.type === "email" ? "Email is required" : "Name is required";
      } else if (input.type === "email" && !input.value.includes("@")) {
        isValid = false;
        input.style.borderColor = "rgb(255, 76, 76)";
        input.style.color = "rgb(255, 76, 76)";
        if (errorMsg) errorMsg.textContent = "Invalid email address";
      } else {
        input.style.borderColor = "";
        input.style.color = "";
        if (errorMsg) errorMsg.textContent = "";
      }
    });

    if (isValid) {
      console.log("Form submitted successfully");
    }
  });

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const errorMsg = input.parentElement.querySelector(".error-message");
      input.style.borderColor = "";
      input.style.color = "";
      if (errorMsg) errorMsg.textContent = "";
    });
  });
}
