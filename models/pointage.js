const db = require('../config/database');

const Pointage = {
    getAllPointages: async () => {
        try {
            const [rows] = await db.query(`
                SELECT p.*, 
                       e.nom as employe_nom, e.prenom as employe_prenom,
                       m.nom as manager_nom, m.prenom as manager_prenom
                FROM pointage p
                LEFT JOIN employe e ON p.employeid = e.id
                LEFT JOIN employe m ON p.managerid = m.id
                ORDER BY p.date DESC, p.heure_arrive DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getPointageById: async (id) => {
        try {
            const [rows] = await db.query(`
                SELECT p.*, 
                       e.nom as employe_nom, e.prenom as employe_prenom,
                       m.nom as manager_nom, m.prenom as manager_prenom
                FROM pointage p
                LEFT JOIN employe e ON p.employeid = e.id
                LEFT JOIN employe m ON p.managerid = m.id
                WHERE p.id = ?`, 
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    createPointage: async (pointageData) => {
        try {
            const [result] = await db.query(
                'INSERT INTO pointage (heure_arrive, heure_depart, date, employeid, managerid) VALUES (?, ?, ?, ?, ?)',
                [
                    pointageData.heure_arrive,
                    pointageData.heure_depart,
                    pointageData.date || new Date(),
                    pointageData.employeid,
                    pointageData.managerid
                ]
            );
            return { id: result.insertId, ...pointageData };
        } catch (error) {
            throw error;
        }
    },

    updatePointage: async (id, pointageData) => {
        try {
            const [result] = await db.query(
                'UPDATE pointage SET heure_arrive = ?, heure_depart = ?, date = ?, employeid = ?, managerid = ? WHERE id = ?',
                [
                    pointageData.heure_arrive,
                    pointageData.heure_depart,
                    pointageData.date,
                    pointageData.employeid,
                    pointageData.managerid,
                    id
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    deletePointage: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM pointage WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Pointage; 