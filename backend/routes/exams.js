import express from 'express';
const router = express.Router();

import ExamController from '../controllers/examController.js';

// Get all exams
router.get('/', ExamController.getAllExams);

// Get exam by id
router.get('/:id', ExamController.getExamById);

// Create new exam
router.post('/', ExamController.createExam);

// Update exam
router.put('/:id', ExamController.updateExam);

// Delete exam
router.delete('/:id', ExamController.deleteExam);

// Get exam questions
router.get('/:id/questions', ExamController.getExamQuestions);

// Assign question to exam
router.post('/assign-question', ExamController.assignQuestionToExam);

// Remove question from exam
router.delete('/:examId/questions/:questionId', ExamController.removeQuestionFromExam);

// Get exam results
router.get('/:id/results', ExamController.getExamResults);

// Start exam attempt
router.post('/start-attempt', ExamController.startExamAttempt);

// Submit response
router.post('/submit-response', ExamController.submitResponse);

// Calculate score
router.post('/calculate-score', ExamController.calculateScore);

export default router;
