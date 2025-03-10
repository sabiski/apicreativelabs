const Entretien = require('../models/entretienModel');
const emailService = require('../utils/emailService');
const db = require('../config/database');

// Ajouter la fonction utilitaire getCandidatInfo
// Modifier la fonction getCandidatInfo
const getCandidatInfo = (candidatureId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT c.*, o.titre as poste
            FROM candidature c
            LEFT JOIN offre_emploi o ON c.offre_id = o.id
            WHERE c.id = ?
        `;
        
        db.query(query, [candidatureId], (err, results) => {
            if (err) {
                console.error('Erreur SQL:', err);
                reject(err);
                return;
            }
            
            if (!results || results.length === 0) {
                // Récupérer les informations de base de la candidature
                const fallbackQuery = 'SELECT * FROM candidature WHERE id = ?';
                db.query(fallbackQuery, [candidatureId], (fallbackErr, fallbackResults) => {
                    if (fallbackErr || !fallbackResults || fallbackResults.length === 0) {
                        resolve({
                            nom: 'Non spécifié',
                            email: 'Non spécifié',
                            poste: 'Non spécifié'
                        });
                    } else {
                        resolve({
                            ...fallbackResults[0],
                            poste: 'Non spécifié'
                        });
                    }
                });
                return;
            }
            resolve(results[0]);
        });
    });
};

// Modifier la méthode getEntretienById
getEntretienById: async (req, res) => {
    try {
        const id = req.params.id;

        // Récupérer l'entretien avec les informations de base
        const query = `
            SELECT e.*, c.nom, c.email 
            FROM entretien e
            LEFT JOIN candidature c ON e.candidature_id = c.id
            WHERE e.id = ?
        `;

        const entretien = await new Promise((resolve, reject) => {
            db.query(query, [id], (err, results) => {
                if (err) {
                    console.error('Erreur SQL:', err);
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!entretien) {
            return res.status(404).json({
                success: false,
                message: "Entretien non trouvé"
            });
        }

        // Enrichir avec les informations de l'offre si disponible
        if (entretien.candidature_id) {
            try {
                const candidatInfo = await getCandidatInfo(entretien.candidature_id);
                entretien.candidat = {
                    nom: candidatInfo.nom || entretien.nom || 'Non spécifié',
                    email: candidatInfo.email || entretien.email || 'Non spécifié',
                    poste: candidatInfo.poste || 'Non spécifié'
                };
            } catch (candidatError) {
                console.error('Erreur candidat:', candidatError);
                entretien.candidat = {
                    nom: entretien.nom || 'Non spécifié',
                    email: entretien.email || 'Non spécifié',
                    poste: 'Non spécifié'
                };
            }
        }

        res.status(200).json({
            success: true,
            data: entretien
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de l'entretien",
            error: error.message
        });
    }
}

const entretienController = {
    
        // ... autres méthodes ...
    
        createEntretien: async (req, res) => {
            try {
                console.log('Données reçues:', req.body); // Debug

                const entretienData = {
                    candidature_id: req.body.candidature_id || null,
                    date_entretien: new Date(req.body.date_entretien)
                        .toISOString()
                        .slice(0, 19)
                        .replace('T', ' '),
                    type_entretien: req.body.type_entretien,
                    plateforme: req.body.plateforme,
                    lien_reunion: req.body.lien_reunion || null,
                    recruteur_id: req.body.recruteur_id || null,
                    statut: req.body.statut || 'planifie'
                };

                console.log('Données formatées:', entretienData); // Debug

                const [result] = await db.query(
                    'INSERT INTO entretien SET ?',
                    [entretienData]
                );

                console.log('Résultat insertion:', result); // Debug

                if (result.insertId) {
                    return res.status(201).json({
                        success: true,
                        message: "Entretien créé avec succès",
                        data: {
                            id: result.insertId,
                            ...entretienData
                        }
                    });
                } else {
                    throw new Error("Erreur lors de l'insertion");
                }

            } catch (error) {
                console.error('Erreur createEntretien:', error);
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la création de l'entretien",
                    error: error.message
                });
            }
        },
    
        // ... autres méthodes ...
    

    createRappel: async (req, res) => {
        const entretienId = req.params.id;
        const { rappels, notifications } = req.body;

        try {
            // Récupérer les informations de l'entretien
            const entretien = await Entretien.getEntretienById(entretienId);
            if (!entretien) {
                return res.status(404).json({
                    success: false,
                    message: "Entretien non trouvé"
                });
            }

            // Enregistrer les rappels dans la base de données
            await Rappel.createRappels(entretienId, rappels);

            // Planifier les rappels
            rappels.forEach(rappel => {
                const dateRappel = calculerDateRappel(entretien.date_entretien, rappel.delai, rappel.unite);
                
                // Planifier l'email si demandé
                if (notifications.email) {
                    planifierEmail(dateRappel, entretien, rappel);
                }

                // Enregistrer la notification navigateur si demandée
                if (notifications.navigateur) {
                    planifierNotificationNavigateur(dateRappel, entretien, rappel);
                }
            });

            res.status(200).json({
                success: true,
                message: "Rappels configurés avec succès"
            });

        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la configuration des rappels",
                error: error
            });
        }
    },

    getEntretiensByCandidature: (req, res) => {
        const candidatureId = req.params.candidatureId;
        
        Entretien.getEntretiensByCandidature(candidatureId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération des entretiens",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    updateEntretien: async (req, res) => {
        try {
            const entretienId = req.params.id;
            const entretienData = req.body;
    
            // Convertir une chaîne vide en NULL pour recruteur_id
            if (entretienData.recruteur_id === '') {
                entretienData.recruteur_id = null;
            }
    
            // Vérifier que la date est au bon format
            if (entretienData.date_entretien) {
                entretienData.date_entretien = new Date(entretienData.date_entretien)
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');
            }
    
            const result = await db.query(
                'UPDATE entretien SET ? WHERE id = ?',
                [entretienData, entretienId]
            );
    
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Entretien non trouvé"
                });
            }
    
            return res.status(200).json({
                success: true,
                message: "Entretien mis à jour avec succès"
            });
    
        } catch (error) {
            console.error('Erreur updateEntretien:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de l'entretien",
                error: error.message
            });
        }
    },

    deleteEntretien: (req, res) => {
        const id = req.params.id;

        Entretien.deleteEntretien(id, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la suppression de l'entretien",
                    error: err
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Entretien non trouvé"
                });
            }

            res.status(200).json({
                success: true,
                message: "Entretien supprimé avec succès"
            });
        });
    },

    sendEntretienEmail: async (req, res) => {
        try {
            const entretienId = req.params.id;
            const { message, sujet } = req.body;

            // Récupérer les informations de l'entretien et du candidat
            const entretien = await new Promise((resolve, reject) => {
                Entretien.getEntretienById(entretienId, (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (!entretien) {
                return res.status(404).json({
                    success: false,
                    message: "Entretien non trouvé"
                });
            }

            // Récupérer les informations du candidat
            const candidat = await getCandidatInfo(entretien.candidature_id);

            // Envoyer l'email
            await emailService.sendEmail(
                candidat.email,
                'custom',
                {
                    subject: sujet || "Information concernant votre entretien",
                    message: message,
                    date: entretien.date_entretien,
                    type: entretien.type_entretien,
                    lien: entretien.lien_reunion
                }
            );

            res.status(200).json({
                success: true,
                message: "Email envoyé avec succès"
            });

        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de l'envoi de l'email",
                error: error.message
            });
        }
    },

    getAllEntretiens: async (req, res) => {
        try {
            console.log('Début getAllEntretiens'); // Debug

            // Requête modifiée pour gérer les recruteurs non existants
            const [rows] = await db.query(`
                SELECT 
                    e.*,
                    c.nom as nom_candidat,
                    c.email as email_candidat,
                    o.titre as poste,
                    COALESCE(emp.nom, 'Recruteur inconnu') as nom_recruteur,
                    COALESCE(emp.prenom, '') as prenom_recruteur
                FROM entretien e
                LEFT JOIN candidature c ON e.candidature_id = c.id
                LEFT JOIN offre_emploi o ON c.offre_id = o.id
                LEFT JOIN employe emp ON e.recruteur_id = emp.id
                ORDER BY e.date_entretien DESC
            `);

            console.log('Résultats bruts:', rows); // Debug

            // Formater les données
            const formattedRows = rows.map(row => ({
                id: row.id,
                candidature_id: row.candidature_id,
                date_entretien: new Date(row.date_entretien).toISOString(),
                type_entretien: row.type_entretien,
                plateforme: row.plateforme || 'Non spécifiée',
                lien_reunion: row.lien_reunion || '',
                recruteur_id: row.recruteur_id,
                statut: row.statut,
                nom_recruteur: row.nom_recruteur === 'Recruteur inconnu' ? 
                    `Recruteur #${row.recruteur_id} (non trouvé)` : 
                    `${row.prenom_recruteur} ${row.nom_recruteur}`,
                nom_candidat: row.nom_candidat || 'Candidat non assigné',
                email_candidat: row.email_candidat || '',
                poste: row.poste || 'Poste non spécifié'
            }));

            console.log('Données formatées:', formattedRows); // Debug

            return res.status(200).json({
                success: true,
                data: formattedRows
            });
        } catch (error) {
            console.error('Erreur getAllEntretiens:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des entretiens",
                error: error.message
            });
        }
    },

    getRappelsEntretien: async (req, res) => {
        try {
            const entretienId = req.params.id;

            // Récupérer les informations de l'entretien
            const entretien = await new Promise((resolve, reject) => {
                Entretien.getEntretienById(entretienId, (err, results) => {
                    if (err) {
                        console.error('Erreur SQL:', err);
                        reject(err);
                    } else {
                        resolve(results[0]);
                    }
                });
            });

            if (!entretien) {
                return res.status(404).json({
                    success: false,
                    message: "Entretien non trouvé"
                });
            }

            console.log('Entretien trouvé:', entretien);

            // Récupérer les informations du candidat
            const candidat = await getCandidatInfo(entretien.id);
            console.log('Candidat trouvé:', candidat);

            // Calculer la date de l'entretien et les rappels
            const dateEntretien = new Date(entretien.date_entretien);
            const maintenant = new Date();
            const diffJours = Math.ceil((dateEntretien - maintenant) / (1000 * 60 * 60 * 24));

            const rappels = {
                entretien: entretien,
                candidat: candidat,
                rappels: [
                    {
                        type: "24h avant",
                        date: new Date(dateEntretien.getTime() - (24 * 60 * 60 * 1000)),
                        envoyé: diffJours <= 1
                    },
                    {
                        type: "1 semaine avant",
                        date: new Date(dateEntretien.getTime() - (7 * 24 * 60 * 60 * 1000)),
                        envoyé: diffJours <= 7
                    }
                ]
            };

            res.status(200).json({
                success: true,
                data: rappels
            });

        } catch (error) {
            console.error('Erreur complète:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des rappels",
                error: error.message
            });
        }
    },

    sendRappelEntretien: async (req, res) => {
        try {
            // Logique d'envoi de rappel à implémenter
            return res.status(200).json({
                success: true,
                message: "Rappel envoyé avec succès"
            });
        } catch (error) {
            console.error('Erreur sendRappelEntretien:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'envoi du rappel",
                error: error.message
            });
        }
    },

    setRappelEntretien: async (req, res) => {
        try {
            const rappelData = {
                entretien_id: req.params.id,
                type_rappel: req.body.type_rappel,
                date_rappel: req.body.date_rappel,
                notifications: req.body.notifications,
                statut: 'actif'
            };

            await db.query(
                'INSERT INTO rappel_entretien SET ?',
                [rappelData]
            );

            return res.status(201).json({
                success: true,
                message: "Rappel créé avec succès"
            });
        } catch (error) {
            console.error('Erreur setRappelEntretien:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la création du rappel",
                error: error.message
            });
        }
    },

    // Méthode utilitaire pour convertir les délais
    convertirDelaiEnMs: (delai, unite) => {
        const conversions = {
            'minutes': delai * 60 * 1000,
            'heures': delai * 60 * 60 * 1000,
            'jours': delai * 24 * 60 * 60 * 1000
        };
        return conversions[unite] || 0;
    },

    getEntretienById: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    e.*,
                    c.nom as nom_candidat,
                    c.email as email_candidat,
                    o.titre as poste,
                    u.nom as nom_recruteur
                FROM entretien e
                LEFT JOIN candidature c ON e.candidature_id = c.id
                LEFT JOIN offre_emploi o ON c.offre_id = o.id
                LEFT JOIN employe u ON e.recruteur_id = u.id
                WHERE e.id = ?
            `, [req.params.id]);

            if (!rows[0]) {
                return res.status(404).json({
                    success: false,
                    message: "Entretien non trouvé"
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Erreur getEntretienById:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'entretien",
                error: error.message
            });
        }
    },

    // Ajouter une fonction pour récupérer les recruteurs (managers)
    getRecruteurs: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    nom,
                    prenom,
                    email
                FROM employe 
                WHERE role = 'manager'
                ORDER BY nom, prenom
            `);

            return res.status(200).json({
                success: true,
                data: rows.map(row => ({
                    ...row,
                    nom_complet: `${row.prenom} ${row.nom}`
                }))
            });
        } catch (error) {
            console.error('Erreur getRecruteurs:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des recruteurs",
                error: error.message
            });
        }
    }
};

module.exports = entretienController; 