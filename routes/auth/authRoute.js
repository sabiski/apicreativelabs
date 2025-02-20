const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Route login - Version DEV
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM employe WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router; 