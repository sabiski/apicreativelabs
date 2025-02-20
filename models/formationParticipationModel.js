const db = require('../config/database');

const FormationParticipation = {
    getAllParticipations: function(callback) {
        db.query('SELECT * FROM formation_participation', callback);
    },

    getParticipationById: function(id, callback) {
        db.query('SELECT * FROM formation_participation WHERE id = ?', [id], callback);
    },

    getParticipationsByFormation: function(formationId, callback) {
        db.query('SELECT * FROM formation_participation WHERE formation_id = ?', [formationId], callback);
    },

    getParticipationsByEmployee: function(employeId, callback) {
        db.query('SELECT * FROM formation_participation WHERE employe_id = ?', [employeId], callback);
    },

    createParticipation: function(participationData, callback) {
        db.query('INSERT INTO formation_participation SET ?', participationData, callback);
    },

    updateParticipation: function(id, participationData, callback) {
        db.query('UPDATE formation_participation SET ? WHERE id = ?', [participationData, id], callback);
    },

    deleteParticipation: function(id, callback) {
        db.query('DELETE FROM formation_participation WHERE id = ?', [id], callback);
    }
};

module.exports = FormationParticipation; 