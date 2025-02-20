require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// Définir le mode développement
process.env.NODE_ENV = 'development';

// Middlewares de base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const employeRoutes = require('./routes/employe/employeRoute');
const authRoutes = require('./routes/auth/authRoute');
const competenceRoutes = require('./routes/carriere/competenceRoute');
const planCarriereRoutes = require('./routes/carriere/planCarriereRoute');
const formationRoutes = require('./routes/formation/formationRoute');

// Définition des routes
app.use('/api/employes', employeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/competences', competenceRoutes);
app.use('/api/plan-carriere', planCarriereRoutes);
app.use('/api/formations', formationRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`);
});
