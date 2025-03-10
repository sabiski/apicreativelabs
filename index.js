require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const candidatureRoutes = require('./routes/recrutement/candidatureRoute');
const entretienRoutes = require('./routes/recrutement/entretienRoute');
const evaluationRoutes = require('./routes/evaluation/evaluationRoute');

// Définir le mode développement
process.env.NODE_ENV = 'development';

// Configuration CORS
app.use(cors({
    origin: '*', // En développement seulement. En production, spécifiez votre domaine
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
app.use(express.json());

// Middlewares de base
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir les fichiers statiques
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Pour déboguer les accès aux fichiers
app.use('/api/uploads', (req, res, next) => {
    console.log('Accès au fichier:', req.url);
    console.log('Chemin complet:', path.join(process.cwd(), 'uploads', req.url));
    next();
});

// Routes
const employeRoutes = require('./routes/employe/employeRoute');
const authRoutes = require('./routes/auth/authRoute');
const competenceRoutes = require('./routes/carriere/competenceRoute');
const planCarriereRoutes = require('./routes/carriere/planCarriereRoute');
const formationRoutes = require('./routes/formation/formationRoute');
const formationParticipationRoutes = require('./routes/formationParticipationRoutes');
const congeRoutes = require('./routes/conge/congeRoute');
const paieRoutes = require('./routes/paie/paieRoute');
const presenceAbsenceRoutes = require('./routes/presenceAbsence/presenceAbsenceRoute');
const pointageRoutes = require('./routes/pointage/pointageRoute');
const offreEmploiRoutes = require('./routes/offreEmploiRoutes');
const evaluationCandidatRoute = require('./routes/entretiens/evaluationCandidatRoute');
app.use('/api/candidatures', candidatureRoutes);


// Définition des routes
app.use('/api/employes', employeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/api/plan-carriere', planCarriereRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/formation-participation', formationParticipationRoutes);
app.use('/api/conges', congeRoutes);
app.use('/api/paies', paieRoutes);
app.use('/api/presence-absence', presenceAbsenceRoutes);
app.use('/api/pointages', pointageRoutes); 
app.use('/api/offres-emploi', offreEmploiRoutes); 
app.use('/api/entretiens', entretienRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/entretiens/evaluations-candidat', evaluationCandidatRoute);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`);
});
