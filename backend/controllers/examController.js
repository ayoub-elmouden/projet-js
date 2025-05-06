import { pool } from '../config/db.js';

class ExamController {

  async getAllExams(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT e.*, m.Matiere 
        FROM exams e 
        JOIN inf_mat m ON e.Id_mat = m.Id_mat
        ORDER BY e.Date DESC
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ message: 'Error fetching exams' });
    }
  }


  async getExamById(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT e.*, m.Matiere 
        FROM exams e 
        JOIN inf_mat m ON e.Id_mat = m.Id_mat 
        WHERE e.Id_exam = ?
      `, [req.params.id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching exam:', error);
      res.status(500).json({ message: 'Error fetching exam' });
    }
  }


  async createExam(req, res) {
    try {
      const { Titre, Date, Duree, Score_Total, Id_mat, Description, Target_Audience, Access_Link } = req.body;
      
      if (!Titre || !Date || !Duree || !Score_Total || !Id_mat || !Description || !Access_Link) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      const [result] = await pool.query(
        'INSERT INTO exams (Titre, Date, Duree, Score_Total, Id_mat, Description, Target_Audience, Access_Link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [Titre, Date, Duree, Score_Total, Id_mat, Description, Target_Audience || null, Access_Link]
      );
      
      res.status(201).json({ message: 'Exam created successfully', examId: result.insertId });
    } catch (error) {
      console.error('Error creating exam:', error);
      res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
  }


  async updateExam(req, res) {
    try {
      const { Titre, Date, Duree, Score_Total, Id_mat, Description, Target_Audience, Access_Link } = req.body;
      
      const [result] = await pool.query(
        'UPDATE exams SET Titre = ?, Date = ?, Duree = ?, Score_Total = ?, Id_mat = ?, Description = ?, Target_Audience = ?, Access_Link = ? WHERE Id_exam = ?',
        [Titre, Date, Duree, Score_Total, Id_mat, Description, Target_Audience || null, Access_Link, req.params.id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.json({ message: 'Exam updated successfully' });
    } catch (error) {
      console.error('Error updating exam:', error);
      res.status(500).json({ message: 'Error updating exam' });
    }
  }


  async deleteExam(req, res) {
    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        await connection.query('DELETE FROM student_responses WHERE Id_exam = ?', [req.params.id]);
        await connection.query('DELETE FROM exam_attempts WHERE Id_exam = ?', [req.params.id]);
        await connection.query('DELETE FROM inf_scores WHERE Id_exam = ?', [req.params.id]);
        await connection.query('DELETE FROM exam_questions WHERE Id_exam = ?', [req.params.id]);
        
        const [result] = await connection.query('DELETE FROM exams WHERE Id_exam = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return res.status(404).json({ message: 'Exam not found' });
        }
        
        await connection.commit();
        connection.release();
        res.json({ message: 'Exam deleted successfully' });
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      res.status(500).json({ message: 'Error deleting exam' });
    }
  }


  async getExamQuestions(req, res) {
    try {
      const [questions] = await pool.query(
        `SELECT q.* FROM questions q 
         JOIN exam_questions eq ON q.Id_question = eq.Id_question
         WHERE eq.Id_exam = ?
         ORDER BY q.Id_question`,
        [req.params.id]
      );
      
      for (const question of questions) {
        if (question.Type_Question === 'QCM') {
          const [options] = await pool.query(
            `SELECT * FROM mcq_options WHERE Id_question = ?`,
            [question.Id_question]
          );
          question.options = options;
        }
      }
      
      res.json(questions);
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      res.status(500).json({ message: 'Error fetching exam questions' });
    }
  }


  async assignQuestionToExam(req, res) {
    try {
      const { examId, questionId } = req.body;
      
      if (!examId || !questionId) {
        return res.status(400).json({ message: 'Both examId and questionId are required' });
      }
      
      const [exams] = await pool.query('SELECT Id_exam FROM exams WHERE Id_exam = ?', [examId]);
      if (exams.length === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      const [questions] = await pool.query('SELECT Id_question FROM questions WHERE Id_question = ?', [questionId]);
      if (questions.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      const [existing] = await pool.query(
        'SELECT * FROM exam_questions WHERE Id_exam = ? AND Id_question = ?',
        [examId, questionId]
      );
      
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Question already assigned to this exam' });
      }
      
      await pool.query(
        'INSERT INTO exam_questions (Id_exam, Id_question) VALUES (?, ?)',
        [examId, questionId]
      );
      
      res.status(201).json({ message: 'Question assigned to exam successfully' });
    } catch (error) {
      console.error('Error assigning question to exam:', error);
      res.status(500).json({ message: 'Error assigning question to exam' });
    }
  }


  async removeQuestionFromExam(req, res) {
    try {
      const { examId, questionId } = req.params;
      
      const [result] = await pool.query(
        'DELETE FROM exam_questions WHERE Id_exam = ? AND Id_question = ?',
        [examId, questionId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Question not assigned to this exam' });
      }
      
      res.json({ message: 'Question removed from exam successfully' });
    } catch (error) {
      console.error('Error removing question from exam:', error);
      res.status(500).json({ message: 'Error removing question from exam' });
    }
  }


  async getExamResults(req, res) {
    try {
      const [rows] = await pool.query(
        `SELECT e.Id_etu, e.Nom, e.Prenom, e.email, s.Score, 
         (SELECT Score_Total FROM exams WHERE Id_exam = ?) as Total_Possible
         FROM inf_scores s 
         JOIN inf_etu e ON s.Id_etu = e.Id_etu
         WHERE s.Id_exam = ?
         ORDER BY s.Score DESC`,
        [req.params.id, req.params.id]
      );
      
      res.json(rows);
    } catch (error) {
      console.error('Error fetching exam results:', error);
      res.status(500).json({ message: 'Error fetching exam results' });
    }
  }


  async startExamAttempt(req, res) {
    try {
      const { Id_etu, Id_exam, Latitude, Longitude } = req.body;
      
      if (!Id_etu || !Id_exam) {
        return res.status(400).json({ message: 'Student ID and Exam ID are required' });
      }
      
      const [existingAttempts] = await pool.query(
        'SELECT * FROM exam_attempts WHERE Id_etu = ? AND Id_exam = ?',
        [Id_etu, Id_exam]
      );
      
      if (existingAttempts.length > 0) {
        return res.status(409).json({ message: 'Student has already attempted this exam' });
      }
      
      const [result] = await pool.query(
        'INSERT INTO exam_attempts (Id_etu, Id_exam, Latitude, Longitude, Start_Time) VALUES (?, ?, ?, ?, NOW())',
        [Id_etu, Id_exam, Latitude || null, Longitude || null]
      );
      
      res.status(201).json({ message: 'Exam attempt started successfully', attemptId: result.insertId });
    } catch (error) {
      console.error('Error starting exam attempt:', error);
      res.status(500).json({ message: 'Error starting exam attempt' });
    }
  }


  async submitResponse(req, res) {
    try {
      const { Id_etu, Id_exam, Id_question, Response } = req.body;
      
      if (!Id_etu || !Id_exam || !Id_question || Response === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      const [existingResponse] = await pool.query(
        'SELECT * FROM student_responses WHERE Id_etu = ? AND Id_exam = ? AND Id_question = ?',
        [Id_etu, Id_exam, Id_question]
      );
      
      if (existingResponse.length > 0) {
        await pool.query(
          'UPDATE student_responses SET Response = ? WHERE Id_etu = ? AND Id_exam = ? AND Id_question = ?',
          [Response, Id_etu, Id_exam, Id_question]
        );
        
        res.json({ message: 'Response updated successfully' });
      } else {
        await pool.query(
          'INSERT INTO student_responses (Id_etu, Id_exam, Id_question, Response) VALUES (?, ?, ?, ?)',
          [Id_etu, Id_exam, Id_question, Response]
        );
        
        res.status(201).json({ message: 'Response submitted successfully' });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      res.status(500).json({ message: 'Error submitting response' });
    }
  }


  async calculateScore(req, res) {
    try {
      const { Id_etu, Id_exam } = req.body;
      
      if (!Id_etu || !Id_exam) {
        return res.status(400).json({ message: 'Student ID and Exam ID are required' });
      }
      
      const [questions] = await pool.query(
        `SELECT q.Id_question, q.Points, q.Type_Question, q.Expected_Answer, q.Tolerance
         FROM questions q 
         JOIN exam_questions eq ON q.Id_question = eq.Id_question
         WHERE eq.Id_exam = ?`,
        [Id_exam]
      );
      
      const [responses] = await pool.query(
        'SELECT Id_question, Response FROM student_responses WHERE Id_etu = ? AND Id_exam = ?',
        [Id_etu, Id_exam]
      );
      
      const responseMap = {};
      responses.forEach(resp => {
        responseMap[resp.Id_question] = resp.Response;
      });
      
      let totalScore = 0;
      
      for (const question of questions) {
        const response = responseMap[question.Id_question];
        let questionScore = 0;
        
        if (response !== undefined) {
          if (question.Type_Question === 'QCM') {
            const [options] = await pool.query(
              'SELECT Option_Text FROM mcq_options WHERE Id_question = ? AND Is_Correct = true',
              [question.Id_question]
            );
            
            const correctOptions = options.map(opt => opt.Option_Text);
            const studentAnswers = response.split(',').map(ans => ans.trim());
            
            const correctAnswers = studentAnswers.filter(ans => correctOptions.includes(ans));
            
            if (correctAnswers.length === correctOptions.length && studentAnswers.length === correctOptions.length) {
              questionScore = question.Points;
            }
          } else if (question.Type_Question === 'Direct') {
            if (question.Expected_Answer === response) {
              questionScore = question.Points;
            } else if (question.Tolerance) {
              const expected = parseFloat(question.Expected_Answer);
              const student = parseFloat(response);
              
              if (!isNaN(expected) && !isNaN(student) && Math.abs(expected - student) <= question.Tolerance) {
                questionScore = question.Points;
              }
            }
          }
          
          await pool.query(
            'UPDATE student_responses SET Score = ? WHERE Id_etu = ? AND Id_exam = ? AND Id_question = ?',
            [questionScore, Id_etu, Id_exam, question.Id_question]
          );
        }
        
        totalScore += questionScore;
      }
      
      const [existingScore] = await pool.query(
        'SELECT * FROM inf_scores WHERE Id_etu = ? AND Id_exam = ?',
        [Id_etu, Id_exam]
      );
      
      if (existingScore.length > 0) {
        await pool.query(
          'UPDATE inf_scores SET Score = ? WHERE Id_etu = ? AND Id_exam = ?',
          [totalScore, Id_etu, Id_exam]
        );
      } else {
        await pool.query(
          'INSERT INTO inf_scores (Id_etu, Id_exam, Score) VALUES (?, ?, ?)',
          [Id_etu, Id_exam, totalScore]
        );
      }
      
      res.json({ message: 'Score calculated successfully', score: totalScore });
    } catch (error) {
      console.error('Error calculating score:', error);
      res.status(500).json({ message: 'Error calculating score' });
    }
  }
}

export default new ExamController();