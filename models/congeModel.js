const db = require('../config/database');

const congeModel = {
    // Obtenir tous les congés
    getAllConges: async () => {
        const [conges] = await db.query(`
            SELECT 
                c.*,
                e.nom,
                e.prenom,
                e.poste
            FROM conge c
            JOIN employe e ON c.employeid = e.id
            ORDER BY c.date_debut DESC
        `);
        return conges;
    },

    // Obtenir un congé spécifique
    getCongeById: async (id) => {
        const [conge] = await db.query(`
            SELECT 
                c.*,
                e.nom,
                e.prenom,
                e.poste
            FROM conge c
            JOIN employe e ON c.employeid = e.id
            WHERE c.id = ?`,
            [id]
        );
        return conge[0];
    },

    // Créer un nouveau congé
    createConge: async (congeData) => {
        const { typeconge, date_debut, date_fin, status, employeid } = congeData;
        const [result] = await db.query(`
            INSERT INTO conge (
                typeconge,
                date_debut,
                date_fin,
                status,
                employeid
            ) VALUES (?, ?, ?, ?, ?)`,
            [typeconge, date_debut, date_fin, status, employeid]
        );
        return result.insertId;
    },

    // Mettre à jour un congé
    updateConge: async (id, congeData) => {
        const { typeconge, date_debut, date_fin, status } = congeData;
        const [result] = await db.query(`
            UPDATE conge 
            SET 
                typeconge = ?,
                date_debut = ?,
                date_fin = ?,
                status = ?
            WHERE id = ?`,
            [typeconge, date_debut, date_fin, status, id]
        );
        return result.affectedRows > 0;
    },

    // Supprimer un congé
    deleteConge: async (id) => {
        const [result] = await db.query('DELETE FROM conge WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Obtenir les congés d'un employé
    getCongesByEmploye: async (employeId) => {
        const [conges] = await db.query(`
            SELECT * FROM conge 
            WHERE employeid = ?
            ORDER BY date_debut DESC`,
            [employeId]
        );
        return conges;
    }
};

module.exports = congeModel; 