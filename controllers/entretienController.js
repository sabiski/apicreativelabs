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
                const entretienData = {
                    candidature_id: req.body.candidature_id,
                    date_entretien: req.body.date_entretien,
                    type_entretien: req.body.type_entretien,
                    plateforme: req.body.plateforme,
                    lien_reunion: req.body.lien_reunion || null,
                    recruteur_id: req.body.recruteur_id,
                    statut: 'planifie'
                };
    
                // Vérifier si la candidature existe
                const checkCandidature = await new Promise((resolve, reject) => {
                    db.query(
                        'SELECT id FROM candidature WHERE id = ?',
                        [entretienData.candidature_id],
                        (err, results) => {
                            if (err) reject(err);
                            resolve(results);
                        }
                    );
                });
    
                if (!checkCandidature || checkCandidature.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "ID de candidature invalide ou non trouvé"
                    });
                }
    
                // Créer l'entretien
                const createEntretien = await new Promise((resolve, reject) => {
                    db.query(
                        'INSERT INTO entretien SET ?',
                        entretienData,
                        (err, result) => {
                            if (err) reject(err);
                            resolve(result);
                        }
                    );
                });
    
                // Mettre à jour le statut de la candidature
                await new Promise((resolve, reject) => {
                    db.query(
                        'UPDATE candidature SET statut = "interview" WHERE id = ?',
                        [entretienData.candidature_id],
                        (err, result) => {
                            if (err) reject(err);
                            resolve(result);
                        }
                    );
                });
    
                // Récupérer l'entretien créé avec les informations complètes
                const newEntretien = await new Promise((resolve, reject) => {
                    db.query(
                        `SELECT e.*, c.nom, c.email 
                        FROM entretien e 
                        LEFT JOIN candidature c ON e.candidature_id = c.id 
                        WHERE e.id = ?`,
                        [createEntretien.insertId],
                        (err, results) => {
                            if (err) reject(err);
                            resolve(results[0]);
                        }
                    );
                });
    
                // Envoyer les notifications si nécessaire
                try {
                    const candidat = await getCandidatInfo(entretienData.candidature_id);
                    if (candidat && candidat.email) {
                        await emailService.sendEntretienInvitation(candidat, {
                            date: entretienData.date_entretien,
                            type: entretienData.type_entretien,
                            lien: entretienData.lien_reunion
                        });
                    }
                } catch (emailError) {
                    console.error('Erreur lors de l\'envoi des notifications:', emailError);
                    // Ne pas bloquer la création si l'envoi d'email échoue
                }
    
                res.status(201).json({
                    success: true,
                    message: "Entretien planifié avec succès",
                    data: newEntretien
                });
    
            } catch (error) {
                console.error('Erreur:', error);
                res.status(500).json({
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
        const id = req.params.id;
        const entretienData = req.body;

        try {
            Entretien.updateEntretien(id, entretienData, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la mise à jour de l'entretien",
                        error: err
                    });
                }

                // Si la date ou l'heure a changé, envoyer une notification
                if (entretienData.date_entretien) {
                    try {
                        const candidat = await getCandidatInfo(entretienData.candidature_id);
                        await emailService.sendEmail(
                            candidat.email,
                            'entretienUpdate',
                            {
                                date: entretienData.date_entretien,
                                type: entretienData.type_entretien,
                                lien: entretienData.lien_reunion
                            }
                        );
                    } catch (emailError) {
                        console.error('Erreur lors de l\'envoi de la notification:', emailError);
                    }
                }

                res.status(200).json({
                    success: true,
                    message: "Entretien mis à jour avec succès"
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de l'entretien",
                error: error
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

    getAllEntretiens: (req, res) => {
        Entretien.getAllEntretiens((err, results) => {
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
            const entretienId = req.params.id;
            const { type } = req.body;

            // Récupérer les informations de l'entretien
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

            // Envoyer le rappel par email
            await emailService.sendEmail(
                candidat.email,
                'rappelEntretien',
                {
                    subject: "Rappel : Votre entretien",
                    message: `Rappel : Vous avez un entretien prévu le ${new Date(entretien.date_entretien).toLocaleString()}.
                    Type d'entretien : ${entretien.type_entretien}
                    ${entretien.lien_reunion ? `Lien de réunion : ${entretien.lien_reunion}` : ''}`,
                    nom: candidat.nom,
                    date: entretien.date_entretien
                }
            );

            res.status(200).json({
                success: true,
                message: "Rappel envoyé avec succès"
            });

        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de l'envoi du rappel",
                error: error.message
            });
        }
    },

    setRappelEntretien: async (req, res) => {
        try {
            const entretienId = req.params.id;
            const { rappels, notifications } = req.body;

            console.log('Données reçues:', { entretienId, rappels, notifications }); // Debug

            // Vérifier si l'entretien existe
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

            // Supprimer les anciens rappels pour cet entretien
            await new Promise((resolve, reject) => {
                Entretien.deleteRappels(entretienId, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Créer les nouveaux rappels
            const dateEntretien = new Date(entretien.date_entretien);
            const rappelsPromises = rappels.map(rappel => {
                let delaiMs;
                switch(rappel.unite) {
                    case 'minutes':
                        delaiMs = rappel.delai * 60 * 1000;
                        break;
                    case 'heures':
                        delaiMs = rappel.delai * 60 * 60 * 1000;
                        break;
                    case 'jours':
                        delaiMs = rappel.delai * 24 * 60 * 60 * 1000;
                        break;
                    default:
                        delaiMs = 0;
                }

                const dateRappel = new Date(dateEntretien.getTime() - delaiMs);

                return new Promise((resolve, reject) => {
                    Entretien.createRappel({
                        entretien_id: entretienId,
                        type_rappel: `${rappel.delai} ${rappel.unite}`,
                        date_rappel: dateRappel,
                        notifications: JSON.stringify(notifications),
                        statut: 'planifié'
                    }, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            });

            await Promise.all(rappelsPromises);

            res.status(200).json({
                success: true,
                message: "Rappels configurés avec succès"
            });

        } catch (error) {
            console.error('Erreur complète:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la configuration des rappels",
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
            const id = req.params.id;

            const entretien = await new Promise((resolve, reject) => {
                Entretien.getEntretienById(id, (err, results) => {
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

            // Récupérer les informations détaillées
            const candidat = await getCandidatInfo(entretien.candidature_id);
            
            // Enrichir l'objet entretien avec les informations du candidat
            const entretienComplet = {
                ...entretien,
                candidat: {
                    nom: candidat.nom,
                    email: candidat.email,
                    poste: candidat.poste
                }
            };

            res.status(200).json({
                success: true,
                data: entretienComplet
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

    
};

module.exports = entretienController; 