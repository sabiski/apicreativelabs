const db = require('../config/database');

// Récupérer toutes les formations
exports.getAllFormations = async (req, res) => {
    try {
        const [formations] = await db.query('SELECT * FROM formation ORDER BY date_debut DESC');
        res.json({
            success: true,
            data: formations
        });
    } catch (error) {
        console.error('Erreur getAllFormations:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des formations"
        });
    }
};

// Récupérer une formation par ID
exports.getFormationById = async (req, res) => {
    try {
        const [formation] = await db.query('SELECT * FROM formation WHERE id = ?', [req.params.id]);
        if (formation.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Formation non trouvée"
            });
        }
        res.json({
            success: true,
            data: formation[0]
        });
    } catch (error) {
        console.error('Erreur getFormationById:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de la formation"
        });
    }
};

// Créer une formation
exports.createFormation = async (req, res) => {
    try {
        const { 
            titre, 
            description, 
            date_debut, 
            date_fin,
            manager_id,
            status = 'non commencée',
            type,
            categorie,
            max_participants,
            evaluation
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO formation (
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titre, 
                description, 
                date_debut, 
                date_fin,
                manager_id || null,
                status,
                type || null,
                categorie || null,
                max_participants || null,
                evaluation || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Formation créée avec succès",
            data: {
                id: result.insertId,
                titre,
                description,
                date_debut,
                date_fin,
                manager_id,
                status,
                type,
                categorie,
                max_participants,
                evaluation,
                created_at: new Date(),
                updated_at: null
            }
        });
    } catch (error) {
        console.error('Erreur createFormation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la formation",
            error: error.message
        });
    }
};

// Mettre à jour une formation
exports.updateFormation = async (req, res) => {
    try {
        const id = req.params.id;
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

        const [result] = await db.query(
            `UPDATE formation 
            SET titre = ?, 
                description = ?, 
                date_debut = ?, 
                date_fin = ?,
                manager_id = ?,
                status = ?,
                type = ?,
                categorie = ?,
                max_participants = ?,
                evaluation = ?
            WHERE id = ?`,
            [
                titre, 
                description, 
                date_debut, 
                date_fin,
                manager_id || null,
                status || 'non commencée',
                type || null,
                categorie || null,
                max_participants || null,
                evaluation || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Formation non trouvée"
            });
        }

        res.json({
            success: true,
            message: "Formation mise à jour avec succès"
        });
    } catch (error) {
        console.error('Erreur updateFormation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de la formation",
            error: error.message
        });
    }
};

// Supprimer une formation
exports.deleteFormation = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM formation WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Formation non trouvée"
            });
        }
        res.json({
            success: true,
            message: "Formation supprimée avec succès"
        });
    } catch (error) {
        console.error('Erreur deleteFormation:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de la formation"
        });
    }
}; 