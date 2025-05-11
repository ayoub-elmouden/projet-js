import { pool } from '../config/db.js';

const DashboardController = {
  getDashboardSummary: async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();

      // Count total students (from inf_etu table)
      const [students] = await connection.query(
        "SELECT COUNT(*) as count FROM inf_etu"
      );
      const studentCount = students[0].count;

      // Count active exams (where current time is between Date and Date + Duree)
      const now = new Date();
      const [activeExams] = await connection.query(
        "SELECT COUNT(*) as count FROM exams WHERE ? >= Date AND ? <= DATE_ADD(Date, INTERVAL Duree MINUTE)",
        [now, now]
      );
      const activeExamsCount = activeExams[0].count;

      // Count upcoming exams (where Date is in the future)
      const [upcomingExams] = await connection.query(
        "SELECT COUNT(*) as count FROM exams WHERE Date > ?",
        [now]
      );
      const upcomingExamsCount = upcomingExams[0].count;

      // Count pending grades (count student_responses where Score is NULL)
      let pendingGradesCount = 0;
      const [responsesTable] = await connection.query("SHOW TABLES LIKE 'student_responses'");
      if (responsesTable.length > 0) {
        const [pendingGrades] = await connection.query(
          "SELECT COUNT(*) as count FROM student_responses WHERE Score IS NULL"
        );
        pendingGradesCount = pendingGrades[0].count;
      }

      res.status(200).json({
        studentCount,
        activeExamsCount,
        upcomingExamsCount,
        pendingGradesCount
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) connection.release();
    }
  }
};

export default DashboardController;