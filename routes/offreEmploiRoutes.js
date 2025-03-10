const express = require('express');
const router = express.Router();
const offreEmploiController = require('../controllers/offreEmploiController');

// Routes
router.get('/', offreEmploiController.getAllOffres);
router.get('/:id', offreEmploiController.getOffreById); // Route pour un ID spécifique
router.post('/', offreEmploiController.createOffre);
router.put('/:id', offreEmploiController.updateOffre);
router.delete('/:id', offreEmploiController.deleteOffre);

module.exports = router; 