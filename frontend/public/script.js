let exam = [];

document.getElementById("question-type").addEventListener("change", function () {
  const type = this.value;
  document.getElementById("qcm-options").classList.toggle("hidden", type !== "qcm");
});

function addOption() {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Nouvelle option";
  input.className = "option-input";
  document.getElementById("qcm-options").appendChild(input);
}

function addQuestion() {
  const type = document.getElementById("question-type").value;
  const questionText = document.getElementById("question-text").value.trim();

  if (!questionText) {
    alert("Veuillez écrire la question.");
    return;
  }

  let question = { type, text: questionText };

  if (type === "qcm") {
    const options = [...document.querySelectorAll(".option-input")].map(input => input.value.trim()).filter(opt => opt);
    if (options.length < 2) {
      alert("Un QCM doit avoir au moins 2 options.");
      return;
    }
    question.options = options;
  }

  exam.push(question);
  renderExam();
  resetForm();
}

function renderExam() {
  const preview = document.getElementById("exam-preview");
  const jsonOutput = document.getElementById("exam-json");
  preview.innerHTML = "";
  exam.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question-item";
    div.innerHTML = `<strong>Q${i+1}:</strong> ${q.text}<br>`;
    if (q.type === "qcm") {
      q.options.forEach(opt => {
        div.innerHTML += `<input type="radio" disabled> ${opt}<br>`;
      });
    } else {
      div.innerHTML += `<textarea disabled placeholder="Réponse..."></textarea>`;
    }
    preview.appendChild(div);
  });

  jsonOutput.textContent = JSON.stringify(exam, null, 2);
}

function resetForm() {
  document.getElementById("question-text").value = "";
  document.getElementById("qcm-options").innerHTML = `
    <input type="text" placeholder="Option 1" class="option-input">
    <input type="text" placeholder="Option 2" class="option-input">
    <button onclick="addOption()">+ Ajouter une option</button>
  `;
}
