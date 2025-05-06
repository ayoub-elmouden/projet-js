async function createExamOnBackend(examData) {
    try {
      console.log('Creating exam on backend with data:', examData);
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
        console.error('Error creating exam:', errorData);
        alert('Erreur lors de la création de l\'examen: ' + errorData.message);
        return null;
      }
  
      const data = await response.json();
      console.log('Exam created with ID:', data.examId);
      return data.examId;
    } catch (error) {
      console.error('Network error creating exam:', error);
      alert('Erreur réseau lors de la création de l\'examen');
      return null;
    }
  }
  
  async function assignQuestionToExam(examId, question) {
    try {
      console.log('Creating question for exam ID:', examId, 'Question:', question);
      const response = await fetch('/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Contenu: question.text,
          Points: 1,
          Type_Question: question.type === 'qcm' ? 'QCM' : 'Open',
          Duration: 0,
          Media_Path: null,
          Expected_Answer: null,
          Tolerance: null,
          options: question.options ? question.options.map(opt => ({ text: opt, isCorrect: false })) : []
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating question:', errorData);
        alert('Erreur lors de la création de la question: ' + errorData.message);
        return null;
      }
  
      const data = await response.json();
      console.log('Question created with ID:', data.questionId);
  
      return data.questionId;
    } catch (error) {
      console.error('Network error creating question:', error);
      alert('Erreur réseau lors de la création de la question');
      return null;
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
  
    const examId = await createExamOnBackend(result);
    if (!examId) {
      console.error('Failed to create exam, aborting question creation.');
      return;
    }
  
    for (const question of questions) {
      const questionId = await assignQuestionToExam(examId, question);
      if (!questionId) {
        console.error('Failed to create question:', question);
      }
    }
  
    localStorage.setItem("examResult", JSON.stringify({ id: examId, ...result }));
    console.log('Exam data saved to localStorage:', localStorage.getItem("examResult"));
  
    alert('Examen créé et questions enregistrées avec succès');
  }
  
  window.generateJSON = generateJSONWithBackend;
  