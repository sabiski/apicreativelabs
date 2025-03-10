const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const candidatureController = require('../../controllers/candidatureController');
const { upload } = require('../../middlewares/upload');

// Configuration pour multiple fichiers
const uploadFields = upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'lettre_motivation', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

// Routes de base pour les candidatures
router.get('/', candidatureController.getAllCandidatures);
router.get('/:id', candidatureController.getCandidatureById);
router.get('/offre/:offreId', candidatureController.getCandidaturesByOffre);

// Route pour les documents
router.get('/document/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        console.log('Nom du fichier demandé:', filename); // Debug

        // Chemins possibles pour le fichier
        const possiblePaths = [
            path.join(process.cwd(), 'uploads', 'cv', filename),
            path.join(process.cwd(), 'uploads', 'candidatures', filename),
            path.join(process.cwd(), 'uploads', filename),
            // Ajout du nouveau chemin pour les fichiers récents
            path.join('C:', 'Users', 'INFO', 'ApiErp', 'uploads', 'cv', filename)
        ];

        console.log('Recherche dans les chemins:', possiblePaths); // Debug

        // Trouver le premier chemin qui existe
        const filePath = possiblePaths.find(p => {
            const exists = fs.existsSync(p);
            console.log(`Vérification ${p}: ${exists ? 'trouvé' : 'non trouvé'}`); // Debug
            return exists;
        });

        if (!filePath) {
            console.error('Fichier non trouvé dans les dossiers:', possiblePaths);
            return res.status(404).json({
                success: false,
                message: 'Fichier non trouvé'
            });
        }

        console.log('Fichier trouvé à:', filePath); // Debug

        // Définir le type MIME
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        };

        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
        // Envoyer le fichier
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du fichier:', err);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'envoi du fichier'
                });
            }
        });

    } catch (error) {
        console.error('Erreur accès fichier:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'accès au fichier',
            error: error.message
        });
    }
});

// Route pour créer une nouvelle candidature
router.post('/', uploadFields, candidatureController.createCandidature);

// Routes pour mettre à jour et supprimer
router.put('/:id', candidatureController.updateCandidature);
router.delete('/:id', candidatureController.deleteCandidature);

module.exports = router;