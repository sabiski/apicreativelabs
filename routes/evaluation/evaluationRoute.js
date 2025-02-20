const express = require('express');
const router = express.Router();
const evaluationController = require('../../controllers/evaluationController');

// Routes sans vérification de token
router.get('/', evaluationController.getAllEvaluations);
router.get('/:id', evaluationController.getEvaluationById);
router.post('/', evaluationController.createEvaluation);
router.put('/:id', evaluationController.updateEvaluation);
router.delete('/:id', evaluationController.deleteEvaluation);

module.exports = router; 