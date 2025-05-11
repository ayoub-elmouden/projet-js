import express from 'express';
import StudentController from '../controllers/studentController.js';

const router = express.Router();

router.get('/grades', StudentController.getGrades);
router.get('/exams/upcoming', StudentController.getUpcomingExams);
router.get('/exams/completed', StudentController.getCompletedExams);
router.get('/courses', StudentController.getCourses);
router.get('/exam-schedule', StudentController.getExamSchedule);
router.get('/profile', StudentController.getProfile);

export default router;
