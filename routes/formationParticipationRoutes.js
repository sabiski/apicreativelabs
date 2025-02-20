const express = require('express');
const router = express.Router();
const formationParticipationController = require('../controllers/formationParticipationController');

// Routes pour les participations aux formations
router.get('/participations', formationParticipationController.getAllParticipations);
router.get('/participations/:id', formationParticipationController.getParticipationById);
router.get('/formations/:formationId/participations', formationParticipationController.getParticipationsByFormation);
router.get('/employes/:employeId/participations', formationParticipationController.getParticipationsByEmployee);
router.post('/participations', formationParticipationController.createParticipation);
router.put('/participations/:id', formationParticipationController.updateParticipation);
router.delete('/participations/:id', formationParticipationController.deleteParticipation);

module.exports = router; 