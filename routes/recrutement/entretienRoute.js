const express = require('express');
const router = express.Router();
const evaluationCandidatController = require('../../controllers/evaluationCandidatController');
const entretienController = require('../../controllers/entretienController');

// Vérifier que le contrôleur est bien chargé
console.log('Méthodes du contrôleur:', Object.keys(entretienController));

// Routes principales
router.get('/', entretienController.getAllEntretiens);
router.post('/', entretienController.createEntretien);

// Routes pour les évaluations des candidats uniquement
router.get('/evaluations-candidat/list', evaluationCandidatController.getAllEvaluations);
router.post('/evaluations-candidat/list', evaluationCandidatController.createEvaluation);
router.get('/evaluations-candidat/:id', evaluationCandidatController.getEvaluationById);
router.put('/evaluations-candidat/:id', evaluationCandidatController.updateEvaluation);
router.delete('/evaluations-candidat/:id', evaluationCandidatController.deleteEvaluation);

// Route pour les recruteurs
router.get('/recruteurs/list', entretienController.getRecruteurs);

// Routes avec paramètres
router.get('/:id', entretienController.getEntretienById);
router.put('/:id', entretienController.updateEntretien);
router.delete('/:id', entretienController.deleteEntretien);

// Routes pour les rappels
router.post('/:id/rappels', entretienController.setRappelEntretien);
router.get('/:id/rappels', entretienController.getRappelsEntretien);
router.post('/:id/send-rappel', entretienController.sendRappelEntretien);

// Route pour l'envoi d'email
router.post('/:id/email', entretienController.sendEntretienEmail);

module.exports = router;