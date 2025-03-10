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
router.get('/historique-postes/:employeId', planCarriereController.getHistoriquePostes);
router.get('/historique-evaluations/:employeId', planCarriereController.getHistoriqueEvaluations);
router.get('/historique-formations/:employeId', planCarriereController.getHistoriqueFormations);

module.exports = router; 