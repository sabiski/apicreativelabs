const db = require('../config/database');

const paieModel = {
    // Obtenir toutes les paies
    getAllPaie: async () => {
        const [paies] = await db.query(`
            SELECT 
                p.*,
                e.nom,
                e.prenom,
                e.poste
            FROM paie p
            JOIN employe e ON p.employeid = e.id
            ORDER BY p.annee_de_paie DESC, p.mois DESC
        `);
        return paies;
    },

    // Obtenir une paie spécifique
    getPaieById: async (id) => {
        const [paie] = await db.query(`
            SELECT 
                p.*,
                e.nom,
                e.prenom,
                e.poste
            FROM paie p
            JOIN employe e ON p.employeid = e.id
            WHERE p.id = ?`,
            [id]
        );
        return paie[0];
    },

    // Créer une nouvelle paie
    createPaie: async (paieData) => {
        const {
            mois,
            annee_de_paie,
            salairenet,
            prime,
            retenue,
            employeid,
            status,
            type_paie
        } = paieData;

        const [result] = await db.query(`
            INSERT INTO paie (
                mois,
                annee_de_paie,
                salairenet,
                prime,
                retenue,
                employeid,
                status,
                type_paie
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [mois, annee_de_paie, salairenet, prime || 0, retenue || 0, employeid, status || 'en attente', type_paie]
        );
        return result.insertId;
    },

    // Mettre à jour une paie
    updatePaie: async (id, paieData) => {
        const {
            mois,
            annee_de_paie,
            salairenet,
            prime,
            retenue,
            status,
            type_paie
        } = paieData;

        const [result] = await db.query(`
            UPDATE paie 
            SET 
                mois = ?,
                annee_de_paie = ?,
                salairenet = ?,
                prime = ?,
                retenue = ?,
                status = ?,
                type_paie = ?
            WHERE id = ?`,
            [mois, annee_de_paie, salairenet, prime || 0, retenue || 0, status, type_paie, id]
        );
        return result.affectedRows > 0;
    },

    // Supprimer une paie
    deletePaie: async (id) => {
        const [result] = await db.query('DELETE FROM paie WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Obtenir les paies d'un employé
    getPaiesByEmploye: async (employeId) => {
        const [paies] = await db.query(`
            SELECT * FROM paie 
            WHERE employeid = ?
            ORDER BY annee_de_paie DESC, mois DESC`,
            [employeId]
        );
        return paies;
    }
};

module.exports = paieModel; 