const express = require('express');
const router = express.Router();
const formationParticipationController = require('../controllers/formationParticipationController');

// Route pour obtenir les participants d'une formation
router.get('/formations/:formationId/participations', formationParticipationController.getParticipationsByFormation);

// Route pour mettre à jour une participation
router.put('/participations/:id', formationParticipationController.updateParticipation);

// Ajout de la route de suppression
router.delete('/participations/:id', formationParticipationController.deleteParticipation);

// Ajout de la route pour obtenir une participation spécifique
router.get('/participations/:id', formationParticipationController.getParticipationById);

// Ajout de la route pour créer une participation
router.post('/participations', formationParticipationController.createParticipation);

module.exports = router; 