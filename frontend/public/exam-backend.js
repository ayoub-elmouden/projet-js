async function createExamOnBackend(examData) {
  try {
    const response = await fetch('/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Titre: examData.examName,
        Date: new Date().toISOString().split('T')[0],
        Duree: examData.duration,
        Score_Total: 100,
        Id_mat: 1,
        Description: 'Examen créé via interface frontend',
        Target_Audience: null,
        Access_Link: ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert('Erreur lors de la création de l\'examen: ' + errorData.message);
      return null;
    }

    const data = await response.json();
    return data.examId;
  } catch (error) {
    alert('Erreur réseau lors de la création de l\'examen');
    console.error(error);
    return null;
  }
}

async function assignQuestionToExam(examId, question) {
  try {
    // This is a placeholder: backend does not have question creation endpoint
    // So here we just log the question for now
    console.log('Assign question to exam:', examId, question);
  } catch (error) {
    console.error('Erreur lors de l\'assignation de la question:', error);
  }
}

async function generateJSONWithBackend() {
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

  const examId = await createExamOnBackend(result);
  if (!examId) return;

  for (const question of questions) {
    await assignQuestionToExam(examId, question);
  }

  alert('Examen créé et questions assignées (partiellement simulé)');
}

// Override the existing generateJSON function to call generateJSONWithBackend
window.generateJSON = generateJSONWithBackend;
