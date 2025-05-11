import { pool } from '../config/db.js';

const StudentController = {
  getGrades: async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [grades] = await connection.query(
        `SELECT Element, Note, Resultat, Session, Annee
         FROM student_grades
         WHERE Id_etu = ?`,
        [studentId]
      );
      res.status(200).json(grades);
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  getUpcomingExams: async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [exams] = await connection.query(
        `SELECT Id_exam, Titre, Matiere, Date, Duree
         FROM exams
         WHERE Date > NOW()
         ORDER BY Date ASC`
      );
      res.status(200).json(exams);
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  getCompletedExams: async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [exams] = await connection.query(
        `SELECT e.Id_exam, e.Titre, e.Matiere, er.Score, er.Score_Total
         FROM exams e
         JOIN exam_results er ON e.Id_exam = er.Id_exam
         WHERE er.Id_etu = ? AND e.Date <= NOW()
         ORDER BY e.Date DESC`,
        [studentId]
      );
      res.status(200).json(exams);
    } catch (error) {
      console.error('Error fetching completed exams:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  getCourses: async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [courses] = await connection.query(
        `SELECT m.Id_mat, m.Matiere, p.nom AS ProfNom, p.prenom AS ProfPrenom
         FROM matieres m
         JOIN professeurs p ON m.Id_prof = p.Id_Prof
         JOIN filieres f ON m.Id_fil = f.Id_fil
         JOIN inf_etu e ON e.id_fil = f.Id_fil
         WHERE e.Id_etu = ?`,
        [studentId]
      );
      res.status(200).json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  getExamSchedule: async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [schedule] = await connection.query(
        `SELECT Id_exam, Titre, Matiere, Date, Duree
         FROM exams
         WHERE Date >= NOW()
         ORDER BY Date ASC`
      );
      res.status(200).json(schedule);
    } catch (error) {
      console.error('Error fetching exam schedule:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  getProfile: async (req, res) => {
    const studentId = req.query.id;
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    let connection;
    try {
      connection = await pool.getConnection();
      const [profiles] = await connection.query(
        `SELECT Id_etu, nom, prenom, date_naiss, sexe, etablissement, id_fil, email
         FROM inf_etu
         WHERE Id_etu = ?`,
        [studentId]
      );
      if (profiles.length === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(profiles[0]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  }
};

export default StudentController;
