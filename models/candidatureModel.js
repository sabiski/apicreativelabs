const db = require('../config/database');

const Candidature = {
    getAllCandidatures: function(callback) {
        db.query('SELECT * FROM candidature', callback);
    },

    getCandidatureById: function(id, callback) {
        db.query('SELECT * FROM candidature WHERE id = ?', [id], callback);
    },

    getCandidaturesByOffre: function(offreId, callback) {
        db.query('SELECT * FROM candidature WHERE offre_id = ?', [offreId], callback);
    },

    createCandidature: function(candidatureData, callback) {
        db.query('INSERT INTO candidature SET ?', candidatureData, callback);
    },

    updateCandidature: function(id, candidatureData, callback) {
        db.query('UPDATE candidature SET ? WHERE id = ?', [candidatureData, id], callback);
    },

    deleteCandidature: function(id, callback) {
        db.query('DELETE FROM candidature WHERE id = ?', [id], callback);
    },

    getCandidaturesByStatut: function(statut, callback) {
        db.query('SELECT * FROM candidature WHERE statut = ?', [statut], callback);
    }
};

module.exports = Candidature; 