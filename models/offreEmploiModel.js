const db = require('../config/database');

const OffreEmploi = {
    getAllOffres: function(callback) {
        db.query('SELECT * FROM offre_emploi', callback);
    },

    getOffreById: function(id, callback) {
        db.query('SELECT * FROM offre_emploi WHERE id = ?', [id], callback);
    },

    createOffre: function(offreData, callback) {
        db.query('INSERT INTO offre_emploi SET ?', offreData, callback);
    },

    updateOffre: function(id, offreData, callback) {
        db.query('UPDATE offre_emploi SET ? WHERE id = ?', [offreData, id], callback);
    },

    deleteOffre: function(id, callback) {
        db.query('DELETE FROM offre_emploi WHERE id = ?', [id], callback);
    },

    getActiveOffres: function(callback) {
        db.query('SELECT * FROM offre_emploi WHERE date_limite > NOW() AND statut = "active"', callback);
    }
};

module.exports = OffreEmploi; 