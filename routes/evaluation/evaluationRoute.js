const express = require('express');
const router = express.Router();
const evaluationController = require('../../controllers/evaluationController');

// Routes pour les évaluations (même structure que les recruteurs)
router.get('/evaluations/list', evaluationController.getAllEvaluations);
router.post('/evaluations/list', evaluationController.createEvaluation);
router.get('/evaluations/:id', evaluationController.getEvaluationById);
router.put('/evaluations/:id', evaluationController.updateEvaluation);
router.delete('/evaluations/:id', evaluationController.deleteEvaluation);

module.exports = router; 