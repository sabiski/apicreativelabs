const express = require('express');
const router = express.Router();
const evaluationCandidatController = require('../../controllers/evaluationCandidatController');

// Routes pour les évaluations des candidats
router.get('/list', evaluationCandidatController.getAllEvaluations);
router.post('/list', evaluationCandidatController.createEvaluation);
router.get('/:id', evaluationCandidatController.getEvaluationById);
router.put('/:id', evaluationCandidatController.updateEvaluation);
router.delete('/:id', evaluationCandidatController.deleteEvaluation);

module.exports = router; 