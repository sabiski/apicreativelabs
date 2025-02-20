const Employe = require('../models/employe');
const Contrat = require('../models/employe');
const Conge  =  require('../models/employe');
const Paie =  require('../models/employe');
const Pointage =  require('../models/employe');
const Formation =  require('../models/employe');
const PresenceAbsence =  require('../models/employe');
const Blame =  require('../models/employe');
const Historique_poste = require('../models/employe');
const Historique_statut = require('../models/employe');
const documents_employe = require('../models/employe');
const moment = require('moment');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const { generatePassword } = require('../utils/passwordGenerator');
const nodemailer = require('nodemailer');
const db = require('../config/database');

// Configuration email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.getAllEmployes = async (req, res) => {
    try {
        const [employes] = await db.query(`
            SELECT 
                e.id,
                e.nom,
                e.prenom,
                e.email,
                e.telephone,
                e.date_embauche,
                e.statut,
                e.salaire,
                e.photo
            FROM employe e
        `);

        // Vérifier si des employés ont été trouvés
        if (!employes) {
            return res.status(404).json({
                success: false,
                message: "Aucun employé trouvé"
            });
        }

        // Formater les données
        const formattedEmployes = employes.map(emp => ({
            id: emp.id,
            nom: emp.nom || '',
            prenom: emp.prenom || '',
            email: emp.email || '',
            telephone: emp.telephone || 'N/A',
            photo:emp.photo ,
            date_embauche: emp.date_embauche ? new Date(emp.date_embauche).toISOString().split('T')[0] : 'N/A',
            statut: emp.statut || 'Actif',
            salaire: emp.salaire ? emp.salaire.toString() : '0'
        }));

        // Retourner la réponse
        res.json({
            success: true,
            data: formattedEmployes
        });

    } catch (error) {
        console.error('Erreur getAllEmployes:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des employés"
        });
    }
};

// recupere les employe avec leurs formation
exports.getEmployeWithFormation = function(req,res){
    Employe.getEmployeWithFormation((err,employeformation)=>{
        if(err) throw err;
        res.json(employeformation)
    })
}

exports.getEmployeById = async (req, res) => {
    try {
        const employe = await Employe.getEmployeById(req.params.id);
        if (!employe) {
            return res.status(404).json({
                success: false,
                message: "Employé non trouvé"
            });
        }
        res.json({
            success: true,
            data: employe
        });
    } catch (error) {
        console.error('Erreur getEmployeById:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'employé"
        });
    }
};

// Récupérer les employés avec leurs formations
exports.getEmployeWithFormation = function(req, res) {
    Employe.getEmployeWithFormation((err, employeformation) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({ 
                success: false, 
                message: "Erreur lors de la récupération des formations" 
            });
        }
        res.json(employeformation);
    });
};

exports.createEmploye = async (req, res) => {
    try {
        const result = await Employe.createEmploye(req.body);
        res.status(201).json({
            success: true,
            message: "Employé créé avec succès",
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Erreur createEmploye:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de l'employé"
        });
    }
};

exports.updateEmploye = async (req, res) => {
    try {
        const result = await Employe.updateEmploye(req.params.id, req.body);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Employé non trouvé"
            });
        }
        res.json({
            success: true,
            message: "Employé mis à jour avec succès"
        });
    } catch (error) {
        console.error('Erreur updateEmploye:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de l'employé"
        });
    }
};

exports.deleteEmploye = async (req, res) => {
    try {
        const result = await Employe.deleteEmploye(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Employé non trouvé"
            });
        }
        res.json({
            success: true,
            message: "Employé supprimé avec succès"
        });
    } catch (error) {
        console.error('Erreur deleteEmploye:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de l'employé"
        });
    }
};

exports.uploadFile = function(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    // Vous pouvez ajouter ici la logique pour traiter le fichier téléchargé
    // Par exemple, enregistrer le chemin du fichier dans la base de données

    res.status(200).json({ message: 'Fichier téléchargé avec succès', file: req.file });
};



exports.uploadPhoto = function(req, res) {
    const employeId = req.params.id;
    const photoPath = `/uploads/${req.file.filename}`;

    // Mettre à jour le chemin de la photo dans la base de données
    Employe.updateEmploye(employeId, { photo: photoPath }, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la photo de l\'employé:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la photo de l\'employé' });
        }
        res.json({ message: 'Photo téléchargée avec succès', photo: photoPath });
    });
};

// get all contrat
// Récupérer tous les contrats
exports.getAllContrats = function (req, res) {
    Contrat.getAllContrats((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération des contrats:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des contrats' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un contrat par ID
exports.getContratById = function (req, res) {
    const contratId = req.params.id;

    Contrat.getContratById(contratId, (err, contrat) => {
        if (err) {
            console.error('Erreur lors de la récupération du contrat:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération du contrat' });
        }

        if (!contrat) {
            return res.status(404).json({ message: 'Contrat non trouvé' });
        }

        res.status(200).json(contrat);
    });
};

// Créer un nouveau contrat
exports.createContrat = (req, res) => {
    const contratData = {
        employeid: req.params.id,
        type_contrat: req.body.type_contrat,
        date_debut: req.body.date_debut,
        date_fin: req.body.date_fin,
        salaire: req.body.salaire,
        fichier_contrat: req.file ? `/uploads/contrats/${req.file.filename}` : null,
        statut: req.body.statut || 'actif'
    };

    Employe.createContrat(contratData, (err, result) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la création du contrat"
            });
        }
        res.status(201).json({
            success: true,
            message: "Contrat créé avec succès",
            data: { id: result.insertId, ...contratData }
        });
    });
};


exports.updateContrat = function(req, res) {
    const updatedContrat = {
        typecontrat: req.body.typecontrat,
        datedebut:req.body.datedebut,
        datefin: req.body.datefin,
        employeid:req.body.employeid,
        
    };

    Contrat.updatedContrat(req.params.id, updatedContrat, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Employe updated successfully' });
    });
};


exports.deleteContrat= function(req, res) {
    Contrat.deleteContrat(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Employe deleted successfully' });
    });
};

// controller conge

exports.getAllConges = function (req, res) {
    Conge.getAllConges((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération des conges:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des conges' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un conge par ID
exports.getCongeById = function (req, res) {
    const CongeId = req.params.id;

    Conge.getCongeById(CongeId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération du Conge:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération du Conge' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'Conge non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

// Créer un nouveau Conge
exports.createConge = function (req, res) {
    const {typeconge,date_debut,date_fin,status,employeid} = req.body;
    console.log(`Information: req.body: ${JSON.stringify(req.body)}`);
    

    // Validation des données d'entrée
    if (!typeconge || !date_debut || !date_fin || !employeid || !status) {
        return res.status(400).json({ message: 'Les champs datedebut , datefin, employeid,   sont obligatoires' });
    }

    const newConge = {
        typeconge,
        date_debut,
        date_fin: date_fin || null, // Peut être null si non fourni
        employeid,
        status,
       
    };

    Conge.createConge(newConge, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création du conge:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création du conge' });
        }

        res.status(201).json({ message: 'Conge créé avec succès', CongeId: result.CongeId });
    });
};


exports.updateConge = function(req, res) {
    const updatedConge = {
        date_debut: req.body.date_debut,
        date_fin:req.body.date_fin,
       status:req.body.status,
        typeconge:req.body.typeconge,
        employeid:req.body.employeid,
        
    };

    Conge.updatedConge(req.params.id, updatedConge, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Conge updated successfully' });
    });
};


exports.deleteConge= function(req, res) {
    Conge.deleteConge(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Conge deleted successfully' });
    });
};


//  controller paie 



exports.getAllPaie = function (req, res) {
    Paie.getAllPaie((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération de la paie:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la paie' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un conge par ID
exports.getPaieById = function (req, res) {
    const PaieId = req.params.id;

    Paie.getPaieById(PaieId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération du Conge:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la paie' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'Paie non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

// Créer une nouvelle  Paie
exports.createPaie = function (req, res) {
    const {mois,annee_de_paie,salairenet,prime,retenue,status,type_paie,employeid} = req.body;

    // Validation des données d'entrée
    if (!mois ||!annee_de_paie || !salairenet || !prime || !retenue || !type_paie || !status || !employeid) {
        return res.status(400).json({ message: 'Les champs mois , annee_de_paie, employeid, et total,prime,salairenet, sont obligatoires' });
    }

    const newPaie = {
        mois,
        annee_de_paie,
        salairenet,
        prime,
        retenue,
        type_paie,
        status,
        employeid,
    
      
    };

    Conge.createPaie(newPaie, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création du conge:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la paie' });
        }

        res.status(201).json({ message: 'Paie créé avec succès', PaieId: result.PaieId });
    });
};


exports.updatePaie = function(req, res) {
    const updatedPaie = {
        mois: req.body,mois,
        annee_de_paie:req.body.annee_de_paie,
        salairenet:req.body.salairenet,
        prime:req.body. prime,
        retenue:req.body.retenue,
        total:req.body.total,
        type_paie:req.body.type_paie,
        status:req.body.status,
        employeid:req.body.employeid



        
    };

    Conge.updatedPaie(req.params.id, updatedConge, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Paie updated successfully' });
    });
};


exports.deletePaie= function(req, res) {
    Paie.deletePaie(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Paie deleted successfully' });
    });
};

// controller pointage 
exports.getAllPointages = function (req, res) {
    Pointage.getAllPointages((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération des pointages:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des Pointages' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un Pointage par ID
exports.getPointageById = function (req, res) {
    const PointageId = req.params.id;

    Pointage.getPointageById(PointageId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération du Pointage:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération du Pointage' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'Pointage non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

// Créer un nouveau Conge
exports.createPointage = function (req, res) {
    const {heure_arrive,date,heure_depart,managerid,employeid} = req.body;

    // Validation des données d'entrée
    if (!heure_arrive ||!heure_depart || !date || !employeid || !managerid) {
        return res.status(400).json({ message: 'Les champs heure_arrive , heure_depart,date ,heure_depart, employeid, et managerid  sont obligatoires' });
    }

    const newPointage = {
        heure_arrive,
        heure_depart,
        date, // Peut être null si non fourni
        employeid,
        managerid
    };

    Pointage.createPointage(newPointage, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création du pointage:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création du pointage' });
        }

        res.status(201).json({ message: 'Pointage créé avec succès', PointageId: result.PointageId });
    });
};


exports.updatedPointage = function(req, res) {
    const updatedPointage = {
        heure_arrive: req.body.heure_arrive,
        heure_depart:req.body.heure_depart,
       date:req.body.date,
       managerid:req.body.managerid,
        employeid:req.body.employeid,
        
    };

    Pointage.updatedPointage(req.params.id, updatedPointage, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Pointage updated successfully' });
    });
};


exports.deletePointage= function(req, res) {
    Pointage.deletePointage(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Pointage deleted successfully' });
    });
};


// controller formation

exports.getAllFormations = function (req, res) {
    Formation.getAllFormations((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération des formations:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération des Formations' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un Pointage par ID
exports.getFormationById = function (req, res) {
    const FormationId = req.params.id;

    Formation.getFormationById(FormationId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération de la formation:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la formation' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'formation non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

// Créer un nouveau Conge
exports.createFormation = function (req, res) {
    const {
        titre,
        description,
        date_debut,
        date_fin,
        manager_id,
        status,
        type,
        categorie,
        max_participants,
        evaluation
    } = req.body;

    // Validation des données d'entrée
    if (!titre || !date_debut || !date_fin || !manager_id) {
        return res.status(400).json({ 
            message: 'Les champs titre, date_debut, date_fin et manager_id sont obligatoires' 
        });
    }

    // Validation du status
    if (status && !['en cours', 'terminée', 'non commencée'].includes(status)) {
        return res.status(400).json({ 
            message: 'Le status doit être: en cours, terminée ou non commencée' 
        });
    }

    // Validation du type
    if (type && !['présentiel', 'en ligne', 'hybride'].includes(type)) {
        return res.status(400).json({ 
            message: 'Le type doit être: présentiel, en ligne ou hybride' 
        });
    }

    const newFormation = {
        titre,
        description,
        date_debut,
        date_fin,
        manager_id,
        status: status || 'non commencée',
        type,
        categorie,
        max_participants,
        evaluation
    };

    Formation.createFormation(newFormation, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la Formation:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la Formation' });
        }

        res.status(201).json({ message: 'Formation créée avec succès', formationId: result.insertId });
    });
};


exports.updatedFormation = function(req, res) {
    const {
        titre,
        description,
        date_debut,
        date_fin,
        manager_id,
        status,
        type,
        categorie,
        max_participants,
        evaluation
    } = req.body;

    // Validation du status
    if (status && !['en cours', 'terminée', 'non commencée'].includes(status)) {
        return res.status(400).json({ 
            message: 'Le status doit être: en cours, terminée ou non commencée' 
        });
    }

    // Validation du type
    if (type && !['présentiel', 'en ligne', 'hybride'].includes(type)) {
        return res.status(400).json({ 
            message: 'Le type doit être: présentiel, en ligne ou hybride' 
        });
    }

    const updatedFormation = {
        titre,
        description,
        date_debut,
        date_fin,
        manager_id,
        status,
        type,
        categorie,
        max_participants,
        evaluation
    };

    Formation.updatedFormation(req.params.id, updatedFormation, (err, result) => {
        if (err) {
            console.error('Erreur lors de la mise à jour de la Formation:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la Formation' });
        }
        res.json({ message: 'Formation mise à jour avec succès' });
    });
};


exports.deleteFormation= function(req, res) {
    Formation.deleteFormation(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Formation deleted successfully' });
    });
};


// controller presnce_absence


exports.getAllPresenceAbsences = function (req, res) {
    PresenceAbsence.getAllPresenceAbsences((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération de la presence/absence:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la presence/absence' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un Pointage par ID
exports.getPresenceAbsenceById = function (req, res) {
    const PresenceAbsenceId= req.params.id;

    PresenceAbsence.getPresenceAbsenceById(PresenceAbsenceId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération de la Presence/AbsenceI:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la Presence/Absence' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'Presence/AbsenceId non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

// Créer un nouveau Presence/Absence
exports.createPresenceAbsence = function (req, res) {
    const {date,type,justification, employeid} = req.body;

    // Validation des données d'entrée
    if (!date || !justification  || !type || !employeid ) {
        return res.status(400).json({ message: 'Les champs date, justification ,  employeid  sont obligatoires' });
    }

    const newpresenceAbsence = {
        date,
        justification,
        type,
        employeid,
        
    };

    PresenceAbsence.createPresenceAbsence(newpresenceAbsence, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la presenceAbsence:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la presenceAbsence' });
        }

        res.status(201).json({ message: 'Formation créé avec succès', PresenceAbsenceId: result.PresenceAbsenceId });
    });
};


exports.updatedPresenceAbsence = function(req, res) {
    const updatedPresenceAbsence = {
        date: req.body.date,
        justification:req.body.justification,
        type:req.body.type,
        employeid:req.body.employeid,
        
    };

    PresenceAbsence.updatedPresenceAbsence(req.params.id, updatedPresenceAbsence, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Presence Absence updated successfully' });
    });
};


exports.deletePresenceAbsence= function(req, res) {
    PresenceAbsence.deletePresenceAbsence(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Presence Absence deleted successfully' });
    });
};


// controller blame


exports.getAllBlames = function (req, res) {
    Blame.getAllBlames((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération de la blame:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la blame' });
        }
        res.status(200).json(contrats);
    });
};

// Récupérer un Pointage par ID
exports.getBlameById = function (req, res) {
    const BlameId= req.params.id;

    Blame.getBlameById(BlameId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération de la Blame:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la Blame' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'Blame non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

// Créer un nouveau Presence/Absence
exports.createBlame = function (req, res) {
    const {motif,sanction,date, employeid} = req.body;

    // Validation des données d'entrée
    if (!date || !motif  || !sanction || !employeid ) {
        return res.status(400).json({ message: 'Les champs date, motif ,sanction,  employeid  sont obligatoires' });
    }

    const newblame = {
        date,
        motif,
        sanction,
        employeid,
        
    };

    Blame.createBlame(newblame , (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la Blame:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la Blame' });
        }

        res.status(201).json({ message: 'Blame créé avec succès', BlameId: result.BlameId });
    });
};


exports.updatedBlame= function(req, res) {
    const updatedBlame = {
        date: req.body.date,
        motif:req.body.motif,
        sanction:req.body.sanction,
        employeid:req.body.employeid,
        
    };

    Blame.updatedBlame(req.params.id, updatedBlame, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Blame updated successfully' });
    });
};


exports.deleteBlame= function(req, res) {
    Blame.deleteBlame(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'Blame deleted successfully' });
    });
};


// controller historique_poste

exports.getAllHistoriquePostes = function (req, res) {
    Historique_poste.getAllHistoriquePostes((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération de la historique_poste:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la historique_poste' });
        }
        res.status(200).json(contrats);
    });
};

exports.getHistoriquePosteById = function (req, res) {
    const HistoriquePosteId= req.params.id;

    Historique_poste.getHistoriquePosteById(HistoriquePosteId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération de la historique_poste:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la historique_poste' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'historique_poste non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

exports.createHistoriquePoste = function (req, res) {
    const {date_debut,date_fin,poste,employeid,departement} = req.body;

    // Validation des données d'entrée
    if (!date_debut || !date_fin  || !poste || !employeid   || !departement) {
        return res.status(400).json({ message: 'Les champs date_debut, date_fin ,poste,  employeid  sont obligatoires' });
    }

    const newhistorique_poste = {
        date_debut,
        date_fin,
        poste,
        employeid,
        departement,
        
    };

    Historique_poste.createHistoriquePoste(newhistorique_poste , (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la historique_poste:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la historique_poste' });
        }

        res.status(201).json({ message: 'historique_poste créé avec succès', HistoriquePosteId: result.HistoriquePosteId });
    });
};

exports.updatedHistoriquePoste= function(req, res) {
    const updatedHistoriquePoste = {
        date_debut: req.body.date_debut,
        date_fin:req.body.date_fin,
        poste:req.body.poste,
        employeid:req.body.employeid,
        departement:req.body.departement
        
    };

    Historique_poste.updatedHistoriquePoste(req.params.id, updatedHistoriquePoste, (err, result) => {
        if (err) throw err;
        res.json({ message: 'historique_poste updated successfully' });
    });
};

exports.deleteHistoriquePoste= function(req, res) {
    Historique_poste.deleteHistoriquePoste(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'historique_poste deleted successfully' });
    });
};


// controller historique_statut

exports.getAllHistoriqueStatuts = function (req, res) {
    Historique_statut.getAllHistoriqueStatuts((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération de la historique_statut:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la historique_statut' });
        }
        res.status(200).json(contrats);
    });
};

exports.getHistoriqueStatutById = function (req, res) {
    const HistoriqueStatutId= req.params.id;

    Historique_statut.getHistoriqueStatutById(HistoriqueStatutId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération de la historique_statut:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la historique_statut' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'historique_statut non trouvé' });
        }

        res.status(200).json(Conge);
    });
};

exports.createHistoriqueStatut = function (req, res) {
    const {ancien_statut,nouveau_statut,date_changement,employeid} = req.body;

    // Validation des données d'entrée
    if (!ancien_statut || !nouveau_statut || !date_changement || !employeid ) {
        return res.status(400).json({ message: 'Les champs date_debut, date_fin ,statut,  employeid  sont obligatoires' });
    }

    const newhistorique_statut = {
        ancien_statut,
        nouveau_statut,
        date_changement,
        employeid,
        
    };

    Historique_statut.createHistoriqueStatut(newhistorique_statut , (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la historique_statut:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la historique_statut' });
        }

        res.status(201).json({ message: 'historique_statut créé avec succès', HistoriqueStatutId: result.HistoriqueStatutId });
    });
};

exports.updatedHistoriqueStatut= function(req, res) {
    const updatedHistoriqueStatut = {
        ancien_statut: req.body.ancien_statut,
        nouveau_statut:req.body.nouveau_statut,
        date_changement:req.body.date_changement,
        employeid:req.body.employeid,
        
    };

    Historique_statut.updatedHistoriqueStatut(req.params.id, updatedHistoriqueStatut, (err, result) => {
        if (err) throw err;
        res.json({ message: 'historique_statut updated successfully' });
    });
};

exports.deleteHistoriqueStatut= function(req, res) {
    Historique_statut.deleteHistoriqueStatut(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'historique_statut deleted successfully' });
    });
};
// controller documents_employe

exports.getAllDocumentsEmployes = function (req, res) {
    documents_employe.getAllDocumentsEmployes((err, contrats) => {
        if (err) {
            console.error('Erreur lors de la récupération de la documents_employe:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la documents_employe' });
        }
        res.status(200).json(contrats);
    });
};

exports.getDocumentsEmployeById = function (req, res) {
    const DocumentsEmployeId= req.params.id;

    documents_employe.getDocumentsEmployeById(DocumentsEmployeId, (err, Conge) => {
        if (err) {
            console.error('Erreur lors de la récupération de la documents_employe:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la documents_employe' });
        }

        if (!Conge) {
            return res.status(404).json({ message: 'documents_employe non trouvé' });
        }

        res.status(200).json(Conge);
    });
};


exports.createDocumentsEmploye = function (req, res) {
    const {type_document,chemin_fichier,date_upload,employeid} = req.body;

    // Validation des données d'entrée
    if (!type_document|| !chemin_fichier || !date_upload || !employeid ) {
        return res.status(400).json({ message: 'Les champs titre, description ,date,  employeid  sont obligatoires' });
    }

    const newdocuments_employe = {
        type_document,
        chemin_fichier,
        date_upload,
        employeid,
        
    };

    documents_employe.createDocumentsEmploye(newdocuments_employe , (err, result) => {
        if (err) {
            console.error('Erreur lors de la création de la documents_employe:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la création de la documents_employe' });
        }

        res.status(201).json({ message: 'documents_employe créé avec succès', DocumentsEmployeId: result.DocumentsEmployeId });
    });
};


exports.updatedDocumentsEmploye= function(req, res) {
    const updatedDocumentsEmploye = {
        type_document: req.body.type_document,
        chemin_fichier:req.body.chemin_fichier,
        date_upload:req.body.date_upload,
        employeid:req.body.employeid,
        
    };

    documents_employe.updatedDocumentsEmploye(req.params.id, updatedDocumentsEmploye, (err, result) => {
        if (err) throw err;
        res.json({ message: 'documents_employe updated successfully' });
    });
};


exports.deleteDocumentsEmploye= function(req, res) {
    documents_employe.deleteDocumentsEmploye(req.params.id, (err, result) => {
        if (err) throw err;
        res.json({ message: 'documents_employe deleted successfully' });
    });
};

// Nouvelle méthode pour l'authentification
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative de connexion:', { email, password });

        // Vérifier les identifiants admin
        if (email === 'admin@gmail.com' && password === 'admin') {
            // Créer un token JWT
            const token = jwt.sign(
                { 
                    userId: 1, 
                    role: 'ADMIN' 
                },
                'votre_secret_jwt',  // À remplacer par une vraie clé secrète en production
                { expiresIn: '24h' }
            );
            
            // Créer la session
            req.session.isAuthenticated = true;
            req.session.userId = 1;
            req.session.userRole = 'ADMIN';

            console.log('Session créée:', {
                isAuthenticated: req.session.isAuthenticated,
                userId: req.session.userId,
                userRole: req.session.userRole
            });

            return res.json({
                success: true,
                message: "Connexion réussie",
                token: token,
                user: {
                    id: 1,
                    email: email,
                    role: 'ADMIN'
                }
            });
        }

        res.status(401).json({
            success: false,
            message: "Email ou mot de passe incorrect"
        });

    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la connexion"
        });
    }
};

// Ajouter cette nouvelle méthode
exports.getEmployesByDepartement = function(req, res) {
    const departement = req.params.departement;
    
    Employe.getEmployesByDepartement(departement, (err, employes) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des employés du département"
            });
        }
        res.json({
            success: true,
            data: employes
        });
    });
};

// Gestion des formations
exports.assignFormation = (req, res) => {
    const employeId = req.params.id;
    const formationData = {
        employeid: employeId,
        titre: req.body.titre,
        description: req.body.description,
        date_debut: req.body.date_debut,
        date_fin: req.body.date_fin,
        statut: req.body.statut || 'planifiée',
        formateur: req.body.formateur,
        lieu: req.body.lieu,
        cout: req.body.cout
    };

    Employe.createFormation(formationData, (err, result) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'assignation de la formation"
            });
        }
        res.status(201).json({
            success: true,
            message: "Formation assignée avec succès",
            data: { id: result.insertId, ...formationData }
        });
    });
};

// Gestion des contrats
exports.addContrat = (req, res) => {
    const employeId = req.params.id;
    
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Le fichier du contrat est requis"
        });
    }

    const contratData = {
        employeid: employeId,
        type_contrat: req.body.type_contrat,
        date_debut: req.body.date_debut,
        date_fin: req.body.date_fin || null,
        salaire: req.body.salaire,
        duree_periode_essai: req.body.duree_periode_essai,
        fichier_contrat: `/uploads/contrats/${req.file.filename}`,
        statut: 'actif',
        date_creation: new Date(),
        created_by: req.user.id
    };

    Employe.createContrat(contratData, (err, result) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'ajout du contrat"
            });
        }
        res.status(201).json({
            success: true,
            message: "Contrat ajouté avec succès",
            data: { id: result.insertId, ...contratData }
        });
    });
};

// Gestion des documents
exports.getEmployeDocuments = (req, res) => {
    const employeId = req.params.id;
    
    Employe.getEmployeDocuments(employeId, (err, documents) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des documents"
            });
        }
        res.json({
            success: true,
            data: documents
        });
    });
};

exports.addDocument = (req, res) => {
    const employeId = req.params.id;
    
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Le document est requis"
        });
    }

    const documentData = {
        employe_id: employeId,
        type_document: req.body.type_document,
        chemin_fichier: `/uploads/documents/${req.file.filename}`,
        uploaded_by: req.user.id,
        description: req.body.description || null
    };

    Employe.addDocument(documentData, (err, result) => {
        if (err) {
            console.error('Erreur:', err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'ajout du document"
            });
        }
        res.status(201).json({
            success: true,
            message: "Document ajouté avec succès",
            data: { id: result.insertId, ...documentData }
        });
    });
};

module.exports = exports;



