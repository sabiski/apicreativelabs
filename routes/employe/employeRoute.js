const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const employeController = require('../../controllers/employerController');
const { checkRole } = require('../../middlewares/roleCheck');
const auth = require('../../middlewares/auth');
const db = require('../../config/database');
const bcrypt = require('bcrypt');
const emailService = require('../../utils/emailService');

// Configuration de multer pour les uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes publiques
router.post('/login', employeController.login);

// Routes protégées
router.get('/', async (req, res) => {
    try {
        const [employes] = await db.query('SELECT * FROM employe');
        
        // Formater les données des employés
        const employesFormates = employes.map(employe => ({
            ...employe,
            photo: employe.photo ? `http://localhost:3000${employe.photo}` : null,
            // Formatage des dates si nécessaire
            dateembauche: employe.dateembauche,
            date_creation: employe.date_creation,
            date_modification: employe.date_modification
        }));

        res.json(employesFormates);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [employes] = await db.query('SELECT * FROM employe WHERE id = ?', [req.params.id]);
        if (employes.length === 0) {
            return res.status(404).json({ message: "Employé non trouvé" });
        }
        const employe = {
            ...employes[0],
            photo: employes[0].photo ? `http://localhost:3000${employes[0].photo}` : null
        };
        res.json(employe);
    } catch (error) {
        console.error('Erreur GET /:id', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const {
            nom, prenom, email, dateembauche, poste, salairebase,
            matricule, type_contrat, duree_contrat, periode_essai,
            telephone, departement, nomcontacturgence,
            telephonecontacturgence, relationcontacturgence, adresse
        } = req.body;

        // Génère un mot de passe par défaut
        const defaultPassword = `${prenom.toLowerCase()}${matricule}`;  // exemple: jean12345
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
        const periodeEssaiValue = periode_essai || 0;

        // Insère l'employé avec le mot de passe hashé
        const query = `
            INSERT INTO employe (
                nom, prenom, email, dateembauche, poste, salairebase,
                matricule, type_contrat, duree_contrat, periode_essai,
                telephone, departement, nomcontacturgence,
                telephonecontacturgence, relationcontacturgence, adresse,
                photo, statut, role, password, date_creation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'actif', 'EMPLOYE', ?, NOW())
        `;

        const [result] = await db.query(query, [
            nom, prenom, email, dateembauche, poste, salairebase,
            matricule, type_contrat, duree_contrat, periodeEssaiValue,
            telephone, departement, nomcontacturgence,
            telephonecontacturgence, relationcontacturgence, adresse,
            photoPath, hashedPassword
        ]);

        // Envoie l'email avec les identifiants
        await emailService.sendEmail(
            email,
            'newEmployeeCredentials',
            {
                nom,
                prenom,
                email,
                defaultPassword
            }
        );

        res.status(201).json({
            message: "Employé créé avec succès et identifiants envoyés par email",
            id: result.insertId
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création de l'employé",
            error: error.message 
        });
    }
});

router.put('/:id', upload.single('photo'), async (req, res) => {
    try {
        const employeId = req.params.id;
        const {
            nom, prenom, email, dateembauche, poste, salairebase,
            telephone, matricule, type_contrat, duree_contrat, 
            periode_essai, departement, nomcontacturgence,
            telephonecontacturgence, relationcontacturgence, 
            adresse, statut, role
        } = req.body;

        // Si une nouvelle photo est uploadée
        const photoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

        const updateFields = [];
        const updateValues = [];

        // Ajoute chaque champ non-null à la requête
        if (nom) { updateFields.push('nom = ?'); updateValues.push(nom); }
        if (prenom) { updateFields.push('prenom = ?'); updateValues.push(prenom); }
        if (email) { updateFields.push('email = ?'); updateValues.push(email); }
        if (dateembauche) { updateFields.push('dateembauche = ?'); updateValues.push(dateembauche); }
        if (poste) { updateFields.push('poste = ?'); updateValues.push(poste); }
        if (salairebase) { updateFields.push('salairebase = ?'); updateValues.push(salairebase); }
        if (telephone) { updateFields.push('telephone = ?'); updateValues.push(telephone); }
        if (matricule) { updateFields.push('matricule = ?'); updateValues.push(matricule); }
        if (type_contrat) { updateFields.push('type_contrat = ?'); updateValues.push(type_contrat); }
        if (duree_contrat) { updateFields.push('duree_contrat = ?'); updateValues.push(duree_contrat); }
        if (periode_essai !== undefined) { updateFields.push('periode_essai = ?'); updateValues.push(periode_essai); }
        if (departement) { updateFields.push('departement = ?'); updateValues.push(departement); }
        if (nomcontacturgence) { updateFields.push('nomcontacturgence = ?'); updateValues.push(nomcontacturgence); }
        if (telephonecontacturgence) { updateFields.push('telephonecontacturgence = ?'); updateValues.push(telephonecontacturgence); }
        if (relationcontacturgence) { updateFields.push('relationcontacturgence = ?'); updateValues.push(relationcontacturgence); }
        if (adresse) { updateFields.push('adresse = ?'); updateValues.push(adresse); }
        if (statut) { updateFields.push('statut = ?'); updateValues.push(statut); }
        if (role) { updateFields.push('role = ?'); updateValues.push(role); }
        if (photoPath) { updateFields.push('photo = ?'); updateValues.push(photoPath); }

        // Ajoute toujours la date de modification
        updateFields.push('date_modification = NOW()');

        // Construit la requête
        const query = `
            UPDATE employe 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        // Ajoute l'ID à la fin des valeurs
        updateValues.push(employeId);

        const [result] = await db.query(query, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employé non trouvé" });
        }

        res.json({ 
            message: "Employé mis à jour avec succès",
            success: true
        });

    } catch (error) {
        console.error('Erreur PUT /:id', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour de l'employé",
            error: error.message,
            success: false
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        // Au lieu de supprimer, on désactive
        const [result] = await db.query(
            'UPDATE employe SET statut = "inactif" WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employé non trouvé" });
        }

        res.json({ message: "Employé désactivé avec succès" });
    } catch (error) {
        console.error('Erreur DELETE /:id', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Routes existantes avec contrôle d'accès ajouté
router.get('/formations', checkRole(['ADMIN', 'MANAGER']), employeController.getEmployeWithFormation);

// Routes pour les employés
router.get('/profile', (req, res) => {
    employeController.getEmployeById(req.user.id, req, res);
});

// Routes pour les managers et admins
router.get('/departement/:departement', 
    checkRole(['MANAGER', 'ADMIN']), 
    employeController.getEmployesByDepartement
);

// Routes pour les documents
router.post(
    '/:id/documents',
    checkRole(['ADMIN', 'MANAGER']),
    upload.single('document'),
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Aucun document fourni"
            });
        }
        
        const documentData = {
            type_document: req.body.type_document,
            chemin_fichier: `/uploads/documents/${req.file.filename}`,
            employe_id: req.params.id,
            uploaded_by: req.user.id
        };
        
        employeController.addDocument(documentData, req, res);
    }
);

router.get(
    '/:id/documents',
    checkRole(['ADMIN', 'MANAGER', 'EMPLOYE']),
    async (req, res, next) => {
        // Vérifier si l'employé accède à ses propres documents
        if (req.user.role === 'EMPLOYE' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({
                success: false,
                message: "Vous ne pouvez accéder qu'à vos propres documents"
            });
        }
        next();
    },
    employeController.getEmployeDocuments
);

// Gestion des contrats (admin uniquement)
router.post(
    '/:id/contrat',
    checkRole(['ADMIN']),
    upload.single('contrat'),
    employeController.addContrat
);

// Gestion des formations
router.post(
    '/:id/formations',
    checkRole(['ADMIN', 'MANAGER']),
    employeController.assignFormation
);

// Route de test
router.get('/test', (req, res) => {
    res.json({ message: 'API employés accessible' });
});

// Route pour désactiver un employé
router.put('/:id/deactivate', async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE employe SET statut = "inactif" WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employé non trouvé" });
        }

        res.json({ message: "Employé désactivé avec succès" });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: "Erreur lors de la désactivation de l'employé",
            error: error.message 
        });
    }
});

// Route pour supprimer définitivement un employé
router.delete('/:id/permanent', async (req, res) => {
    try {
        // Commencer une transaction
        await db.query('START TRANSACTION');

        // 1. Supprimer les congés de l'employé
        await db.query(
            'DELETE FROM conge WHERE employeid = ?',
            [req.params.id]
        );

        // 2. Supprimer les participations aux formations
        await db.query(
            'DELETE FROM formation_participation WHERE employe_id = ?',
            [req.params.id]
        );

        // 3. Supprimer ou mettre à NULL les formations où l'employé est manager
        await db.query(
            'UPDATE formation SET manager_id = NULL WHERE manager_id = ?',
            [req.params.id]
        );

        // 4. Enfin, supprimer l'employé
        const [result] = await db.query(
            'DELETE FROM employe WHERE id = ?',
            [req.params.id]
        );

        // Valider la transaction
        await db.query('COMMIT');
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employé non trouvé" });
        }

        res.json({ 
            message: "Employé et toutes ses données associées supprimés avec succès",
            success: true
        });

    } catch (error) {
        // En cas d'erreur, annuler toutes les modifications
        await db.query('ROLLBACK');
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression de l'employé",
            error: error.message,
            success: false
        });
    }
});

// Middleware de gestion des erreurs
router.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(500).json({
        success: false,
        message: "Une erreur est survenue",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
    });
});

module.exports = router;