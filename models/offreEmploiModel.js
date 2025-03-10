const db = require('../config/database');

const OffreEmploi = {
    getAllOffres: async () => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM offre_emploi ORDER BY date_creation DESC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getOffreById: async (id) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM offre_emploi WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    createOffre: async (offreData) => {
        try {
            const [result] = await db.query(
                'INSERT INTO offre_emploi SET ?',
                [offreData]
            );
            return { id: result.insertId, ...offreData };
        } catch (error) {
            throw error;
        }
    },

    updateOffre: async (id, offreData) => {
        try {
            const [result] = await db.query(
                'UPDATE offre_emploi SET ? WHERE id = ?',
                [offreData, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    deleteOffre: async (id) => {
        try {
            // Supprimer d'abord les entretiens liés
            await db.query(`
                DELETE FROM entretien 
                WHERE candidature_id IN (
                    SELECT id FROM candidature WHERE offre_id = ?
                )`, [id]
            );

            // Supprimer les candidatures
            await db.query(
                'DELETE FROM candidature WHERE offre_id = ?',
                [id]
            );

            // Supprimer l'offre
            const [result] = await db.query(
                'DELETE FROM offre_emploi WHERE id = ?',
                [id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur dans deleteOffre:', error);
            throw error;
        }
    },

    getActiveOffres: function(callback) {
        db.query('SELECT * FROM offre_emploi WHERE date_limite > NOW() AND statut = "active"', callback);
    }
};

module.exports = OffreEmploi; 