const db = require('../config/database');

const competenceModel = {
    // Gestion des compétences
    getAllCompetences: async () => {
        const [rows] = await db.query('SELECT * FROM competence ORDER BY nom');
        return rows;
    },

    getCompetenceById: async (id) => {
        const [rows] = await db.query('SELECT * FROM competence WHERE id = ?', [id]);
        return rows[0];
    },

    createCompetence: async (competenceData) => {
        const { nom, description, niveau_requis } = competenceData;
        const [result] = await db.query(
            'INSERT INTO competence (nom, description, niveau_requis) VALUES (?, ?, ?)',
            [nom, description, niveau_requis]
        );
        return result;
    },

    getEmployeCompetences: async (employeId) => {
        const [rows] = await db.query(`
            SELECT c.*, ec.niveau_actuel, ec.date_evaluation 
            FROM competence c 
            JOIN employe_competence ec ON c.id = ec.competence_id 
            WHERE ec.employe_id = ?`,
            [employeId]
        );
        return rows;
    },

    evaluerCompetence: async (employeId, competenceId, niveau) => {
        // Vérifier d'abord si la compétence existe
        const [competence] = await db.query('SELECT id FROM competence WHERE id = ?', [competenceId]);
        
        if (competence.length === 0) {
            throw new Error('Compétence non trouvée');
        }

        // Vérifier si l'employé existe
        const [employe] = await db.query('SELECT id FROM employe WHERE id = ?', [employeId]);
        
        if (employe.length === 0) {
            throw new Error('Employé non trouvé');
        }

        const [result] = await db.query(`
            INSERT INTO employe_competence (employe_id, competence_id, niveau_actuel, date_evaluation)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE niveau_actuel = ?, date_evaluation = NOW()`,
            [employeId, competenceId, niveau, niveau]
        );
        return result;
    }
};

module.exports = competenceModel;
