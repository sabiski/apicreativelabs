const express = require('express');
const router = express.Router();
const formationController = require('../../controllers/formationController');

// Vérifier que les méthodes du contrôleur existent
if (!formationController.getAllFormations) {
    console.error('La méthode getAllFormations n\'existe pas dans le contrôleur');
}

// Définition des routes
router.get('/', formationController.getAllFormations);
router.get('/:id', formationController.getFormationById);
router.post('/', formationController.createFormation);
router.put('/:id', formationController.updateFormation);
router.delete('/:id', formationController.deleteFormation);

module.exports = router;