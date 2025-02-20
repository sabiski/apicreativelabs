const express = require('express');
const router = express.Router();
const entretienController = require('../../controllers/entretienController');

// Routes de base pour les entretiens
router.get('/', entretienController.getAllEntretiens);
router.get('/:id', entretienController.getEntretienById);
router.post('/', entretienController.createEntretien);
router.put('/:id', entretienController.updateEntretien);
router.delete('/:id', entretienController.deleteEntretien);

// Routes pour les rappels
router.post('/:id/rappels', entretienController.setRappelEntretien);
router.get('/:id/rappels', entretienController.getRappelsEntretien);
router.post('/:id/send-rappel', entretienController.sendRappelEntretien);


// Route pour l'envoi d'email
router.post('/:id/email', entretienController.sendEntretienEmail);

module.exports = router;