const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers d'upload s'ils n'existent pas
const createUploadDirs = () => {
    const dirs = ['uploads', 'uploads/photos', 'uploads/documents', 'uploads/cv', 'uploads/lettres'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Définir le sous-dossier selon le type de fichier
        switch (file.fieldname) {
            case 'photo':
                uploadPath += 'photos/';
                break;
            case 'cv':
                uploadPath += 'cv/';
                break;
            case 'lettre_motivation':
                uploadPath += 'lettres/';
                break;
            case 'document':
                uploadPath += 'documents/';
                break;
            default:
                uploadPath += 'documents/';
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Type de fichier non autorisé'), false);
    }
    cb(null, true);
};

// Création de l'instance multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Middleware de gestion des erreurs
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: "Le fichier est trop volumineux (max 5MB)"
            });
        }
        return res.status(400).json({
            success: false,
            message: "Erreur lors de l'upload du fichier",
            error: err.message
        });
    }
    next(err);
};

module.exports = {
    upload,
    handleUploadError
}; 