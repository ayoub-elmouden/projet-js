
import { post } from '../src/utils/api.js';

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

export function initStudentExam() {
  const examData = JSON.parse(localStorage.getItem("examResult")) ||
    JSON.parse(localStorage.getItem("examJSON")); // alternative for test

  if (!examData) {
    alert("Aucun examen trouvé !");
    location.href = "index.html";
    return;
  }

  document.getElementById("exam-title").textContent = `Examen : ${examData.examName}`;
  document.getElementById("exam-info").textContent = `Durée : ${examData.duration} minutes`;

  const form = document.getElementById("student-form");
  form.innerHTML = "";

  examData.questions.forEach((q, index) => {
    const qDiv = document.createElement("div");
    qDiv.className = "form-section";

    qDiv.innerHTML = `<h3>Q${index + 1}. ${q.text}</h3>`;

    if (q.type === "qcm") {
      q.options.forEach((opt, i) => {
        const id = `q${index}-opt${i}`;
        qDiv.innerHTML += `
          <div>
            <input type="radio" name="q${index}" value="${opt}" id="${id}">
            <label for="${id}">${opt}</label>
          </div>`;
      });
    } else {
      qDiv.innerHTML += `<textarea name="q${index}" rows="3" placeholder="Votre réponse ici..."></textarea>`;
    }

    form.appendChild(qDiv);
  });
}

export async function submitExam() {
  const examData = JSON.parse(localStorage.getItem("examResult")) ||
    JSON.parse(localStorage.getItem("examJSON")); // alternative for test

  if (!examData) {
    alert("Aucun examen trouvé !");
    return;
  }

  const answers = {};

  examData.questions.forEach((q, index) => {
    const name = `q${index}`;
    if (q.type === "qcm") {
      const selected = document.querySelector(`input[name="${name}"]:checked`);
      answers[`Q${index + 1}`] = selected ? selected.value : "Aucune réponse";
    } else {
      const field = document.querySelector(`textarea[name="${name}"]`);
      answers[`Q${index + 1}`] = field ? field.value.trim() : "Aucune réponse";
    }
  });

  document.getElementById("student-answers").textContent = JSON.stringify(answers, null, 2);

  try {
    const response = await post('/exams/submit-response', {
      examId: examData.id || null,
      answers: answers,
      studentId: localStorage.getItem('studentId') || null
    });
    alert('Réponses soumises avec succès !');
    localStorage.setItem("examResult", JSON.stringify(answers));
  } catch (error) {
    alert('Erreur lors de la soumission des réponses : ' + error.message);
  }
}

export function initExamPage() {
  const name = localStorage.getItem("examName");
  const nbQuestions = parseInt(localStorage.getItem("nbQuestions"));
  const duration = localStorage.getItem("duration");

  if (!name || !nbQuestions || !duration) {
    alert("Informations d'examen manquantes dans le stockage local.");
    return;
  }

  document.getElementById("exam-title").textContent = `Examen : ${name}`;
  document.getElementById("exam-info").textContent = `Durée : ${duration} min | Nombre de questions : ${nbQuestions}`;

  const form = document.getElementById("questions-form");
  form.innerHTML = "";

  for (let i = 0; i < nbQuestions; i++) {
    const qDiv = document.createElement("div");
    qDiv.className = "form-section";

    qDiv.innerHTML = `
      <h3>Question ${i + 1}</h3>
      <label>Type :</label>
      <select name="type-${i}" onchange="toggleOptions(this, ${i})">
        <option value="qcm">QCM</option>
        <option value="open">Réponse ouverte</option>
      </select>

      <input type="text" name="text-${i}" placeholder="Texte de la question" required>

      <div class="options" id="options-${i}">
        <input type="text" name="opt1-${i}" placeholder="Option 1">
        <input type="text" name="opt2-${i}" placeholder="Option 2">
        <input type="text" name="opt3-${i}" placeholder="Option 3">
        <input type="text" name="opt4-${i}" placeholder="Option 4">
      </div>
    `;
    form.appendChild(qDiv);
  }
}

export function toggleOptions(select, index) {
  const optDiv = document.getElementById(`options-${index}`);
  optDiv.style.display = select.value === "qcm" ? "block" : "none";
}

export function generateJSON() {
  const name = localStorage.getItem("examName");
  const nbQuestions = parseInt(localStorage.getItem("nbQuestions"));
  const duration = localStorage.getItem("duration");

  const questions = [];

  for (let i = 0; i < nbQuestions; i++) {
    const type = document.querySelector(`[name="type-${i}"]`).value;
    const text = document.querySelector(`[name="text-${i}"]`).value.trim();

    if (!text) {
      alert(`Veuillez remplir le texte de la question ${i + 1}`);
      return;
    }

    const question = { type, text };

    if (type === "qcm") {
      const opts = [];
      for (let j = 1; j <= 4; j++) {
        const val = document.querySelector(`[name="opt${j}-${i}"]`).value.trim();
        if (val) opts.push(val);
      }
      if (opts.length < 2) {
        alert(`La question ${i + 1} doit avoir au moins 2 options.`);
        return;
      }
      question.options = opts;
    }

    questions.push(question);
  }

  const result = {
    examName: name,
    duration: duration,
    questions: questions
  };

  document.getElementById("result-json").textContent = JSON.stringify(result, null, 2);
  localStorage.setItem("examJSON", JSON.stringify(result));
}

export async function submitExam() {
  const examJSON = localStorage.getItem("examJSON");
  if (!examJSON) {
    alert("Veuillez générer l'examen avant de le soumettre.");
    return;
  }

  try {
    const examData = JSON.parse(examJSON);
    const response = await post('/exams', examData);
    alert("Examen soumis avec succès !");
    // Optionally clear localStorage or redirect
  } catch (error) {
    alert("Erreur lors de la soumission de l'examen : " + error.message);
  }
}
