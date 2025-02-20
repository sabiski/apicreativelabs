const express = require('express');
const router = express.Router();
const db = require('../../config/database');

router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative de connexion:', { email, password });

        const [employes] = await db.query('SELECT * FROM employe WHERE email = ?', [email]);
        
        if (employes.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }

        const employe = employes[0];

        // Vérification simple pour le développement
        if (password === 'admin' && employe.password === '$2b$10$YourHashedPasswordHereICI') {
            // Initialiser la session
            req.session.isAuthenticated = true;
            req.session.userId = employe.id;
            req.session.userRole = employe.role;

            // Sauvegarder la session explicitement
            req.session.save((err) => {
                if (err) {
                    console.error('Erreur de sauvegarde de session:', err);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la connexion"
                    });
                }

                console.log('Session après login:', req.session);
                
                res.json({
                    success: true,
                    message: "Connexion réussie",
                    user: {
                        id: employe.id,
                        email: employe.email,
                        nom: employe.nom,
                        prenom: employe.prenom,
                        role: employe.role
                    }
                });
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect"
            });
        }
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la connexion"
        });
    }
});

module.exports = router; 