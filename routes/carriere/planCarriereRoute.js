const express = require('express');
const router = express.Router();
const planCarriereController = require('../../controllers/planCarriereController');

// Routes principales
router.get('/', planCarriereController.getAllPlanCarriere);
router.get('/employe/:employeId', planCarriereController.getPlanCarriere);
router.post('/', planCarriereController.createPlanCarriere);
router.put('/employe/:employeId', planCarriereController.updatePlanCarriere);
router.delete('/employe/:employeId', planCarriereController.deletePlanCarriere);

// Routes pour l'historique
router.get('/employe/:employeId/evaluations', planCarriereController.getHistoriqueEvaluations);
router.get('/employe/:employeId/formations', planCarriereController.getHistoriqueFormations);
router.get('/employe/:employeId/postes', planCarriereController.getHistoriquePostes);

module.exports = router; 