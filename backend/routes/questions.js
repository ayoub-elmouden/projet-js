import express from 'express';
const router = express.Router();

import QuestionController from '../controllers/questionController.js';

// Get all questions
router.get('/', QuestionController.getAllQuestions);

// Get question by id
router.get('/:id', QuestionController.getQuestionById);

// Create new question
router.post('/', QuestionController.createQuestion);

// Update question
router.put('/:id', QuestionController.updateQuestion);

// Delete question
router.delete('/:id', QuestionController.deleteQuestion);

// Get question options
router.get('/:id/options', QuestionController.getQuestionOptions);

// Add option to question
router.post('/:id/options', QuestionController.addQuestionOption);

// Delete option from question
router.delete('/:id/options/:optionId', QuestionController.deleteQuestionOption);

// Get questions by subject
router.get('/subject/:subjectId', QuestionController.getQuestionsBySubject);

export default router;
