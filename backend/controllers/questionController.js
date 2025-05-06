import { pool } from '../config/db.js';

class QuestionController {
  async getAllQuestions(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM questions ORDER BY Id_question DESC');
      for (const question of rows) {
        if (question.Type_Question === 'QCM') {
          const [options] = await pool.query(
            'SELECT * FROM qcm_options WHERE Id_question = ?',
            [question.Id_question]
          );
          question.options = options;
        }
      }
      res.json(rows);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Error fetching questions' });
    }
  }

  async getQuestionById(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM questions WHERE Id_question = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      const question = rows[0];
      if (question.Type_Question === 'QCM') {
        const [options] = await pool.query(
          'SELECT * FROM qcm_options WHERE Id_question = ?',
          [question.Id_question]
        );
        question.options = options;
      }
      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ message: 'Error fetching question' });
    }
  }

  async createQuestion(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { Contenu, Points, Type_Question, Duration, Media_Path, Expected_Answer, Tolerance, options } = req.body;
      if (!Contenu || !Points || !Type_Question || !Duration) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const [result] = await connection.query(
        'INSERT INTO questions (Contenu, Points, Type_Question, Duration, Media_Path, Expected_Answer, Tolerance) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [Contenu, Points, Type_Question, Duration, Media_Path || null, Expected_Answer || null, Tolerance || null]
      );
      const questionId = result.insertId;
      if (Type_Question === 'QCM' && Array.isArray(options) && options.length > 0) {
        for (const option of options) {
          await connection.query(
            'INSERT INTO qcm_options (Id_question, Option_Text, Is_Correct) VALUES (?, ?, ?)',
            [questionId, option.text, option.isCorrect ? 1 : 0]
          );
        }
      }
      await connection.commit();
      connection.release();
      res.status(201).json({ message: 'Question created successfully', questionId });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error creating question:', error);
      res.status(500).json({ message: 'Error creating question', error: error.message });
    }
  }

  async updateQuestion(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { Contenu, Points, Type_Question, Duration, Media_Path, Expected_Answer, Tolerance, options } = req.body;
      const [result] = await connection.query(
        'UPDATE questions SET Contenu = ?, Points = ?, Type_Question = ?, Duration = ?, Media_Path = ?, Expected_Answer = ?, Tolerance = ? WHERE Id_question = ?',
        [Contenu, Points, Type_Question, Duration, Media_Path || null, Expected_Answer || null, Tolerance || null, req.params.id]
      );
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Question not found' });
      }
      if (Type_Question === 'QCM' && Array.isArray(options)) {
        await connection.query('DELETE FROM qcm_options WHERE Id_question = ?', [req.params.id]);
        for (const option of options) {
          await connection.query(
            'INSERT INTO qcm_options (Id_question, Option_Text, Is_Correct) VALUES (?, ?, ?)',
            [req.params.id, option.text, option.isCorrect ? 1 : 0]
          );
        }
      }
      await connection.commit();
      connection.release();
      res.json({ message: 'Question updated successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error updating question:', error);
      res.status(500).json({ message: 'Error updating question' });
    }
  }

  async deleteQuestion(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM qcm_options WHERE Id_question = ?', [req.params.id]);
      await connection.query('DELETE FROM exam_questions WHERE Id_question = ?', [req.params.id]);
      await connection.query('DELETE FROM student_responses WHERE Id_question = ?', [req.params.id]);
      const [result] = await connection.query('DELETE FROM questions WHERE Id_question = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Question not found' });
      }
      await connection.commit();
      connection.release();
      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error deleting question:', error);
      res.status(500).json({ message: 'Error deleting question' });
    }
  }

  async getQuestionOptions(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM qcm_options WHERE Id_question = ?', [req.params.id]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching question options:', error);
      res.status(500).json({ message: 'Error fetching question options' });
    }
  }

  async addQuestionOption(req, res) {
    try {
      const { Option_Text, Is_Correct } = req.body;
      if (!Option_Text) {
        return res.status(400).json({ message: 'Option text is required' });
      }
      const [questions] = await pool.query('SELECT Type_Question FROM questions WHERE Id_question = ?', [req.params.id]);
      if (questions.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      if (questions[0].Type_Question !== 'QCM') {
        return res.status(400).json({ message: 'Can only add options to QCM type questions' });
      }
      const [result] = await pool.query(
        'INSERT INTO qcm_options (Id_question, Option_Text, Is_Correct) VALUES (?, ?, ?)',
        [req.params.id, Option_Text, Is_Correct ? 1 : 0]
      );
      res.status(201).json({ message: 'Option added successfully', optionId: result.insertId });
    } catch (error) {
      console.error('Error adding question option:', error);
      res.status(500).json({ message: 'Error adding question option' });
    }
  }

  async deleteQuestionOption(req, res) {
    try {
      const [result] = await pool.query(
        'DELETE FROM qcm_options WHERE Id_option = ? AND Id_question = ?',
        [req.params.optionId, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Option not found' });
      }
      res.json({ message: 'Option deleted successfully' });
    } catch (error) {
      console.error('Error deleting question option:', error);
      res.status(500).json({ message: 'Error deleting question option' });
    }
  }

  async getQuestionsBySubject(req, res) {
    try {
      const [rows] = await pool.query(
        `SELECT q.* FROM questions q
         JOIN exam_questions eq ON q.Id_question = eq.Id_question
         JOIN exams e ON eq.Id_exam = e.Id_exam
         WHERE e.Id_mat = ?
         GROUP BY q.Id_question
         ORDER BY q.Id_question`,
        [req.params.subjectId]
      );
      for (const question of rows) {
        if (question.Type_Question === 'QCM') {
          const [options] = await pool.query('SELECT * FROM qcm_options WHERE Id_question = ?', [question.Id_question]);
          question.options = options;
        }
      }
      res.json(rows);
    } catch (error) {
      console.error('Error fetching questions by subject:', error);
      res.status(500).json({ message: 'Error fetching questions by subject' });
    }
  }
}

export default new QuestionController();