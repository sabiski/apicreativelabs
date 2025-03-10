const db = require('../config/database');

const PresenceAbsence = {
    getAllPresenceAbsences: async () => {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, e.nom, e.prenom 
                FROM presence_absence pa
                JOIN employe e ON pa.employeid = e.id
                ORDER BY pa.date DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getPresenceAbsenceById: async (id) => {
        try {
            const [rows] = await db.query(`
                SELECT pa.*, e.nom, e.prenom 
                FROM presence_absence pa
                JOIN employe e ON pa.employeid = e.id
                WHERE pa.id = ?`, 
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    createPresenceAbsence: async (presenceData) => {
        try {
            const [result] = await db.query(
                'INSERT INTO presence_absence (date, type, justification, employeid) VALUES (?, ?, ?, ?)',
                [presenceData.date, presenceData.type, presenceData.justification || null, presenceData.employeid]
            );
            return { id: result.insertId, ...presenceData };
        } catch (error) {
            throw error;
        }
    },

    updatePresenceAbsence: async (id, presenceData) => {
        try {
            const [result] = await db.query(
                'UPDATE presence_absence SET date = ?, type = ?, justification = ?, employeid = ? WHERE id = ?',
                [presenceData.date, presenceData.type, presenceData.justification || null, presenceData.employeid, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    deletePresenceAbsence: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM presence_absence WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = PresenceAbsence; 