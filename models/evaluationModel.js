const db = require('../config/database');

const Evaluation = {
    getAllEvaluations: function(callback) {
        db.query('SELECT * FROM evaluation_candidat', callback);
    },

    getEvaluationById: function(id, callback) {
        db.query('SELECT * FROM evaluation_candidat WHERE id = ?', [id], callback);
    },

    getEvaluationsByCandidature: function(candidatureId, callback) {
        db.query('SELECT * FROM evaluation_candidat WHERE candidature_id = ?', [candidatureId], callback);
    },

    createEvaluation: function(evaluationData, callback) {
        db.query('INSERT INTO evaluation_candidat SET ?', evaluationData, callback);
    },

    updateEvaluation: function(id, evaluationData, callback) {
        db.query('UPDATE evaluation_candidat SET ? WHERE id = ?', [evaluationData, id], callback);
    },

    deleteEvaluation: function(id, callback) {
        db.query('DELETE FROM evaluation_candidat WHERE id = ?', [id], callback);
    },

    // Récupérer les candidats non évalués
    getUnevaluatedCandidates: function(evaluatedIds, callback) {
        const query = `
            SELECT c.*, 
                   o.titre as poste,
                   (SELECT COUNT(*) FROM entretiens e WHERE e.candidature_id = c.id) as nb_entretiens
            FROM candidatures c
            LEFT JOIN offres_emploi o ON c.offre_id = o.id
            WHERE c.id NOT IN (?)
            AND c.statut = 'en_cours'
            ORDER BY c.date_candidature DESC
        `;

        db.query(query, [evaluatedIds.length ? evaluatedIds : [0]], callback);
    },

    // Vérifier si une évaluation existe déjà pour une candidature
    getEvaluationByCandidature: function(candidatureId, callback) {
        const query = `
            SELECT e.*, 
                   CONCAT(r.nom, ' ', r.prenom) as recruteur_nom,
                   c.nom as candidat_nom,
                   o.titre as poste
            FROM evaluations e
            JOIN candidatures c ON e.candidature_id = c.id
            JOIN employes r ON e.recruteur_id = r.id
            LEFT JOIN offres_emploi o ON c.offre_id = o.id
            WHERE e.candidature_id = ?
        `;

        db.query(query, [candidatureId], callback);
    },

    // Obtenir les statistiques d'évaluation par recruteur
    getEvaluationStatsByRecruteur: function(recruteurId, callback) {
        const query = `
            SELECT 
                COUNT(*) as total_evaluations,
                AVG(note_technique) as moyenne_technique,
                AVG(note_soft_skills) as moyenne_soft_skills,
                AVG((note_technique + note_soft_skills) / 2) as moyenne_globale,
                COUNT(CASE WHEN ((note_technique + note_soft_skills) / 2) >= 4 THEN 1 END) as excellentes_evaluations,
                DATE_FORMAT(date_evaluation, '%Y-%m') as mois
            FROM evaluations
            WHERE recruteur_id = ?
            GROUP BY DATE_FORMAT(date_evaluation, '%Y-%m')
            ORDER BY mois DESC
        `;

        db.query(query, [recruteurId], callback);
    },

    // Obtenir les évaluations par période
    getEvaluationsByPeriod: function(startDate, endDate, callback) {
        const query = `
            SELECT e.*,
                   CONCAT(r.nom, ' ', r.prenom) as recruteur_nom,
                   c.nom as candidat_nom,
                   o.titre as poste,
                   ((note_technique + note_soft_skills) / 2) as moyenne
            FROM evaluations e
            JOIN candidatures c ON e.candidature_id = c.id
            JOIN employes r ON e.recruteur_id = r.id
            LEFT JOIN offres_emploi o ON c.offre_id = o.id
            WHERE e.date_evaluation BETWEEN ? AND ?
            ORDER BY e.date_evaluation DESC
        `;

        db.query(query, [startDate, endDate], callback);
    }
};

module.exports = Evaluation; 