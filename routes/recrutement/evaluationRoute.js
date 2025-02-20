const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Routes pour les évaluations
router.get('/', (req, res) => {
    db.query('SELECT * FROM evaluation')
        .then(([evaluations]) => {
            res.json({
                success: true,
                data: evaluations
            });
        })
        .catch(error => {
            console.error('Erreur getAllEvaluations:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des évaluations"
            });
        });
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM evaluation WHERE id = ?', [id])
        .then(([evaluation]) => {
            if (evaluation.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Évaluation non trouvée"
                });
            }
            res.json({
                success: true,
                data: evaluation[0]
            });
        })
        .catch(error => {
            console.error('Erreur getEvaluationById:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'évaluation"
            });
        });
});

// Route POST pour créer une évaluation
router.post('/', (req, res) => {
    const { employe_id, date_evaluation, note, commentaire } = req.body;
    db.query(
        'INSERT INTO evaluation (employe_id, date_evaluation, note, commentaire) VALUES (?, ?, ?, ?)',
        [employe_id, date_evaluation, note, commentaire]
    )
    .then(([result]) => {
        res.status(201).json({
            success: true,
            message: "Évaluation créée avec succès",
            data: { id: result.insertId }
        });
    })
    .catch(error => {
        console.error('Erreur createEvaluation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'évaluation"
        });
    });
});

module.exports = router;