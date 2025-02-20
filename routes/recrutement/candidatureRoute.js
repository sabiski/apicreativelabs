const express = require('express');
const router = express.Router();
const candidatureController = require('../../controllers/candidatureController');
const { upload } = require('../../middlewares/upload');

// Configuration pour multiple fichiers
const uploadFields = upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'lettre_motivation', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// Routes de base pour les candidatures
router.get('/', candidatureController.getAllCandidatures);
router.get('/:id', candidatureController.getCandidatureById);
router.get('/offre/:offreId', candidatureController.getCandidaturesByOffre);

// Route pour créer une nouvelle candidature
router.post('/', uploadFields, candidatureController.createCandidature);

// Routes pour mettre à jour et supprimer
router.put('/:id', candidatureController.updateCandidature);
router.delete('/:id', candidatureController.deleteCandidature);

module.exports = router; 