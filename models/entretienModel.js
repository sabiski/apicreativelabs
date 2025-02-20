const db = require('../config/database');

const Entretien = {
    getAllEntretiens: function(callback) {
        db.query('SELECT * FROM entretien ORDER BY date_entretien DESC', callback);
    },

    getEntretienById: function(id, callback) {
        const query = `
            SELECT 
                e.*,
                c.nom as nom_candidat,
                c.email as email_candidat,
                c.offre_id,
                o.titre as poste
            FROM entretien e
            LEFT JOIN candidature c ON e.candidature_id = c.id
            LEFT JOIN offre_emploi o ON c.offre_id = o.id
            WHERE e.id = ?
        `;
        db.query(query, [id], callback);
    },

    getEntretiensByCandidature: function(candidatureId, callback) {
        db.query('SELECT * FROM entretien WHERE candidature_id = ?', [candidatureId], callback);
    },

    createEntretien: function(entretienData, callback) {
        db.query('INSERT INTO entretien SET ?', entretienData, callback);
    },

    updateEntretien: function(id, entretienData, callback) {
        db.query('UPDATE entretien SET ? WHERE id = ?', [entretienData, id], callback);
    },

    deleteEntretien: function(id, callback) {
        db.query('DELETE FROM entretien WHERE id = ?', [id], callback);
    },

    getEntretiensAVenir: function(callback) {
        db.query('SELECT * FROM entretien WHERE date_entretien > NOW()', callback);
    },

    setRappel: function(rappelData, callback) {
        const query = `
            INSERT INTO rappel_entretien 
            (entretien_id, type_rappel, date_rappel, notifications, statut) 
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            date_rappel = VALUES(date_rappel),
            notifications = VALUES(notifications),
            statut = VALUES(statut)
        `;
        
        db.query(query, [
            rappelData.entretien_id,
            rappelData.type_rappel,
            rappelData.date_rappel,
            rappelData.notifications,
            rappelData.statut
        ], callback);
    },

    createRappel: function(rappelData, callback) {
        const query = `
            INSERT INTO rappel_entretien 
            (entretien_id, type_rappel, date_rappel, notifications, statut) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(query, [
            rappelData.entretien_id,
            rappelData.type_rappel,
            rappelData.date_rappel,
            rappelData.notifications,
            rappelData.statut
        ], callback);
    },

    deleteRappels: function(entretienId, callback) {
        const query = 'DELETE FROM rappel_entretien WHERE entretien_id = ?';
        db.query(query, [entretienId], callback);
    },

    getRappels: function(entretienId, callback) {
        const query = `
            SELECT * FROM rappel_entretien 
            WHERE entretien_id = ? 
            ORDER BY date_rappel ASC
        `;
        db.query(query, [entretienId], callback);
    }
};

module.exports = Entretien; 