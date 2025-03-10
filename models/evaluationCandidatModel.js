const db = require('../config/database');

const EvaluationCandidat = {
    getAll: async () => {
        const query = `
            SELECT 
                ec.*,
                c.nom as candidat_nom,
                c.email as candidat_email,
                c.statut as statut_candidature,
                (SELECT CONCAT(prenom, ' ', nom) 
                 FROM employe 
                 WHERE id = ec.recruteur_id) as recruteur_nom,
                o.titre as offre_titre
            FROM evaluation_candidat ec
            LEFT JOIN candidature c ON ec.candidature_id = c.id
            LEFT JOIN offre_emploi o ON c.offre_id = o.id
            ORDER BY ec.date_evaluation DESC
        `;
        
        try {
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    create: async (evaluationData) => {
        const query = `
            INSERT INTO evaluation_candidat 
            (candidature_id, recruteur_id, note_technique, note_soft_skills, commentaires)
            VALUES (?, ?, ?, ?, ?)`;
        
        const values = [
            evaluationData.candidature_id,
            evaluationData.recruteur_id,
            evaluationData.note_technique,
            evaluationData.note_soft_skills,
            evaluationData.commentaires
        ];

        try {
            const [result] = await db.query(query, values);
            return result;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        const query = `
            SELECT 
                ec.*,
                c.nom as candidat_nom,
                c.email as candidat_email,
                c.statut as statut_candidature,
                (SELECT CONCAT(prenom, ' ', nom) 
                 FROM employe 
                 WHERE id = ec.recruteur_id) as recruteur_nom,
                o.titre as offre_titre
            FROM evaluation_candidat ec
            LEFT JOIN candidature c ON ec.candidature_id = c.id
            LEFT JOIN offre_emploi o ON c.offre_id = o.id
            WHERE ec.id = ?`;
        
        try {
            const [rows] = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, evaluationData) => {
        const query = `
            UPDATE evaluation_candidat 
            SET note_technique = ?,
                note_soft_skills = ?,
                commentaires = ?
            WHERE id = ?`;
        
        const values = [
            evaluationData.note_technique,
            evaluationData.note_soft_skills,
            evaluationData.commentaires,
            id
        ];

        try {
            const [result] = await db.query(query, values);
            return result;
        } catch (error) {
            throw error;
        }
    },

    delete: async (id) => {
        const query = 'DELETE FROM evaluation_candidat WHERE id = ?';
        try {
            const [result] = await db.query(query, [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = EvaluationCandidat; 