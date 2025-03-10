const db = require('../config/database');

const Candidature = {
    getAllCandidatures: async () => {
        try {
            const [rows] = await db.query(`
                SELECT c.*, o.titre as offre_titre 
                FROM candidature c 
                LEFT JOIN offre_emploi o ON c.offre_id = o.id 
                ORDER BY c.date_candidature DESC
            `);
            return rows;
        } catch (error) {
            console.error('Erreur SQL getAllCandidatures:', error);
            throw error;
        }
    },

    getCandidatureById: async (id) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM candidature WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    getCandidaturesByOffre: async (offreId) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM candidature WHERE offre_id = ?',
                [offreId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    createCandidature: async (candidatureData) => {
        try {
            const [result] = await db.query(
                'INSERT INTO candidature SET ?',
                [candidatureData]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    updateCandidature: async (id, updateData) => {
        try {
            const [result] = await db.query(
                'UPDATE candidature SET ? WHERE id = ?',
                [updateData, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    deleteCandidature: async (id) => {
        try {
            const [result] = await db.query(
                'DELETE FROM candidature WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    getCandidaturesByStatut: function(statut, callback) {
        db.query('SELECT * FROM candidature WHERE statut = ?', [statut], callback);
    }
};

module.exports = Candidature; 