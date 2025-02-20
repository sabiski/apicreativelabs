// const jwt = require('jsonwebtoken');

// const JWT_SECRET = 'votre_secret_tres_securise'; // En production, utilisez une variable d'environnement

// const auth = (req, res, next) => {
//     // En mode développement, on bypass l'authentification
//     if (process.env.NODE_ENV === 'development') {
//         console.log('Mode développement : authentification bypassée');
//         // Simuler un utilisateur authentifié
//         req.user = {
//             id: 1,
//             role: 'ADMIN',
//             nom: 'Dev User'
//         };
//         return next();
//     }

//     // Le reste du code d'authentification pour la production
//     try {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token manquant"
//             });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error('Erreur auth:', error);
//         res.status(401).json({
//             success: false,
//             message: "Veuillez vous connecter"
//         });
//     }
// };

// // Middleware pour vérifier le rôle
// const checkRole = (roles) => {
//     return (req, res, next) => {
//         if (!req.session.userRole) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Rôle non défini"
//             });
//         }

//         if (!roles.includes(req.session.userRole)) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Accès non autorisé"
//             });
//         }

//         next();
//     };
// };

// module.exports = { auth, checkRole };