const FormationParticipation = require('../models/formationParticipationModel');

exports.getAllParticipations = function(req, res) {
    FormationParticipation.getAllParticipations((err, participations) => {
        if (err) {
            console.error('Erreur lors de la récupération des participations:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.status(200).json(participations);
    });
};

exports.getParticipationById = function(req, res) {
    FormationParticipation.getParticipationById(req.params.id, (err, participation) => {
        if (err) {
            console.error('Erreur lors de la récupération de la participation:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (!participation) {
            return res.status(404).json({ message: 'Participation non trouvée' });
        }
        res.status(200).json(participation);
    });
};

exports.getParticipationsByFormation = function(req, res) {
    FormationParticipation.getParticipationsByFormation(req.params.formationId, (err, participations) => {
        if (err) {
            console.error('Erreur lors de la récupération des participations:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.status(200).json(participations);
    });
};

exports.getParticipationsByEmployee = function(req, res) {
    FormationParticipation.getParticipationsByEmployee(req.params.employeId, (err, participations) => {
        if (err) {
            console.error('Erreur lors de la récupération des participations:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.status(200).json(participations);
    });
};

exports.createParticipation = function(req, res) {
    const { formation_id, employe_id, evaluation, date_participation, status } = req.body;

    if (!formation_id || !employe_id) {
        return res.status(400).json({ 
            message: 'Les champs formation_id et employe_id sont obligatoires' 
        });
    }

    if (status && !['en cours', 'terminée', 'annulée'].includes(status)) {
        return res.status(400).json({ 
            message: 'Le status doit être: en cours, terminée ou annulée' 
        });
    }

    const newParticipation = {
        formation_id,
        employe_id,
        evaluation,
        date_participation,
        status: status || 'en cours'
    };

    FormationParticipation.createParticipation(newParticipation, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la participation:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.status(201).json({ 
            message: 'Participation créée avec succès', 
            participationId: result.insertId 
        });
    });
};

exports.updateParticipation = function(req, res) {
    const { evaluation, date_participation, status } = req.body;

    if (status && !['en cours', 'terminée', 'annulée'].includes(status)) {
        return res.status(400).json({ 
            message: 'Le status doit être: en cours, terminée ou annulée' 
        });
    }

    const updatedParticipation = {
        evaluation,
        date_participation,
        status
    };

    FormationParticipation.updateParticipation(req.params.id, updatedParticipation, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la participation:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json({ message: 'Participation mise à jour avec succès' });
    });
};

exports.deleteParticipation = function(req, res) {
    FormationParticipation.deleteParticipation(req.params.id, (err, result) => {
        if (err) {
            console.error('Erreur lors de la suppression de la participation:', err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        res.json({ message: 'Participation supprimée avec succès' });
    });
}; 