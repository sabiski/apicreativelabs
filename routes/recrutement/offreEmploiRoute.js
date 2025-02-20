const express = require('express');
const router = express.Router();
const offreEmploiController = require('../../controllers/offreEmploiController');
// Middleware d'authentification si nécessaire
// const auth = require('../../middlewares/auth');

// Routes pour les offres d'emploi
router.get('/', offreEmploiController.getAllOffres);
router.post('/', offreEmploiController.createOffre);
router.get('/:id', offreEmploiController.getOffreById);
router.put('/:id', offreEmploiController.updateOffre);
router.delete('/:id', offreEmploiController.deleteOffre);

module.exports = router; 