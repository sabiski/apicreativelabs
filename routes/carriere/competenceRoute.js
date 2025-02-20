const express = require('express');
const router = express.Router();
const competenceController = require('../../controllers/competenceController');

// Routes pour les compétences (sans auth pour le dev)
router.get('/', competenceController.getAllCompetences);
router.get('/:id', competenceController.getCompetenceById);
router.post('/', competenceController.createCompetence);
router.post('/evaluation', competenceController.evaluerCompetence);

module.exports = router;
