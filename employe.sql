
CREATE TABLE employe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    dateembauche DATE NOT NULL, -- Utilisation de DATE pour stocker une date
    poste VARCHAR(100) NOT NULL, -- VARCHAR est plus adapté pour un texte court
    salairebase DECIMAL(10, 2) NOT NULL -- DECIMAL pour des valeurs monétaires
);




CREATE TABLE contrat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_contrat VARCHAR(50) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    description TEXT,
    employeid INT NOT NULL, 
    FOREIGN KEY (employeid) REFERENCES employe(id) 
);

CREATE TABLE CONGE (
id INT AUTO_INCREMENT PRIMARY KEY,
 mois DATE,
annedelapaie DATE,
salairenet INT,
prime BOOL,                  
retenue BOOL
)


CREATE TABLE presence_absence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    type ENUM('presence', 'absence') NOT NULL,
    justification TEXT,
    employeid INT NOT NULL,
    FOREIGN KEY (employeid) REFERENCES employe(id)
);


CREATE TABLE blame (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    motif TEXT NOT NULL,
    sanction TEXT,
    employeid INT NOT NULL,
    FOREIGN KEY (employeid) REFERENCES employe(id)
);



UPDATE employe
SET managerid = 1
WHERE id IN (7, 12, 20,24); 



INSERT INTO conge (typeconge, date_debut, date_fin, status, managerid, employeid)
VALUES
   
    ('Maladie', '2025-02-01', '2025-02-10', 'En attente', 12, 28),
    ('Sans solde', '2025-03-05', '2025-03-15', 'Rejeté', 7, 29),
    ('Maternité', '2025-04-10', '2025-04-20', 'Approuvé', 20, 33);


-- Les employés avec ces IDs ont le manager avec l'ID 1


+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int          | NO   | PRI | NULL    | auto_increment |
| typeconge  | varchar(100) | NO   |     | NULL    |                |
| date_debut | date         | NO   |     | NULL    |                |
| date_fin   | date         | NO   |     | NULL    |                |
| status     | varchar(50)  | NO   |     | NULL    |                |
| managerid  | int          | NO   | MUL | NULL    |                |
| employeid  | int          | NO   | MUL | NULL    |                |
+------------+--------------+------+-----+---------+----------------+



CREATE TABLE paie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mois INT NOT NULL,                -- Le mois pour la paie (ex: 1 pour janvier)
    annee_de_paie INT NOT NULL,       -- L'année de la paie (ex: 2025)
    salairenet DECIMAL(10, 2) NOT NULL, -- Le salaire net
    prime DECIMAL(10, 2),             -- La prime éventuellement
    retenue DECIMAL(10, 2),           -- Les retenues pour des cotisations ou impôts
    total DECIMAL(10, 2) AS (salairenet + prime - retenue) STORED, -- Calcul du total
    employeid INT NOT NULL,           -- L'ID de l'employé         -- La date effective de la paie
    status VARCHAR(50) DEFAULT 'en attente', -- Statut de la paie (ex: "en attente", "payée")
    type_paie ENUM('Mensuelle', 'Hebdomadaire', 'Bimensuelle', 'Annuel', 'Extraordinaire', 'Commissions', 'CDD') NOT NULL, -- Type de la paie
    FOREIGN KEY (employeid) REFERENCES employe(id)
);



CREATE TABLE paie (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- ID unique pour chaque enregistrement
    mois INT NOT NULL,                         -- Mois de la paie (1 pour janvier, 2 pour février, etc.)
    annee_de_paie INT NOT NULL,                -- Année de la paie (ex: 2025)
    salairenet DECIMAL(10, 2) NOT NULL,        -- Salaire net à payer
    prime DECIMAL(10, 2) DEFAULT 0.00,         -- Prime éventuelle (par défaut 0)
    retenue DECIMAL(10, 2) DEFAULT 0.00,       -- Retenue pour les cotisations ou impôts (par défaut 0)
    total DECIMAL(10, 2) GENERATED ALWAYS AS (salairenet + prime - retenue) STORED, -- Total calculé : salaire net + prime - retenue
    employeid INT NOT NULL,                    -- ID de l'employé                  -- Date effective de la paie
    status VARCHAR(50) DEFAULT 'en attente',   -- Statut de la paie (par exemple: "en attente", "payée")
    type_paie ENUM('Mensuelle', 'Hebdomadaire', 'Bimensuelle', 'Annuel', 'Extraordinaire', 'Commissions', 'CDD') NOT NULL, -- Type de paie
    FOREIGN KEY (employeid) REFERENCES employe(id) -- Clé étrangère reliant l'employé à la table "employe"
);


INSERT INTO paie (mois, annee_de_paie, salairenet, prime, retenue, employeid, status, type_paie)
VALUES
    (12, 2025, 2000.00, 500.00, 100.00, 25, '2025-01-30', 'Mensuelle'),
    (24, 2025, 1800.00, 300.00, 50.00, 28, '2025-02-28', 'Mensuelle'),
    (25, 2025, 2200.00, 400.00, 150.00, 29, '2025-03-31', 'Mensuelle'),
    (33, 2025, 2500.00, 600.00, 200.00, 33, '2025-04-30', 'Mensuelle');



-- table formation

CREATE TABLE formation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255),
    description TEXT,
    date_debut DATE,
    date_fin DATE,
    managerid INT,
    employeid INT,
    status ENUM("en cours", "terminée", "non commencée"),
    evaluation DECIMAL(5,2),
    FOREIGN KEY (managerid) REFERENCES employe(id),
    FOREIGN KEY (employeid) REFERENCES employe(id)
);



-- nouvelles information
-- Table des employés
ALTER TABLE employe
    ADD COLUMN photo TEXT,
    ADD COLUMN contact_urgence JSON,
    ADD COLUMN matricule VARCHAR(50) UNIQUE,
    ADD COLUMN superieur_id INT,
    ADD COLUMN type_contrat ENUM('CDD', 'CDI', 'freelance', 'stage') NOT NULL,
    ADD COLUMN duree_contrat INT,
    ADD COLUMN periode_essai INT,
    ADD COLUMN statut ENUM('actif', 'inactif', 'licencié', 'retraite') DEFAULT 'actif',
    ADD COLUMN date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


-- Historique des postes
CREATE TABLE historique_poste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    poste VARCHAR(100) NOT NULL,
    departement VARCHAR(100),
    date_debut DATE NOT NULL,
    date_fin DATE,
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE
);

-- Documents des employés
CREATE TABLE documents_employe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    type_document ENUM('contrat', 'identité', 'attestation', 'bulletin_paie') NOT NULL,
    chemin_fichier TEXT NOT NULL,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE
);

-- Historique des statuts
CREATE TABLE historique_statut (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employe_id INT NOT NULL,
    ancien_statut ENUM('actif', 'inactif', 'licencié', 'retraite') NOT NULL,
    nouveau_statut ENUM('actif', 'inactif', 'licencié', 'retraite') NOT NULL,
    date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE
);




--  nv 
CREATE TABLE employe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    date_naissance DATE NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    photo VARCHAR(255),
    nom_urgence VARCHAR(255) NOT NULL,
    relation_urgence VARCHAR(255) NOT NULL,
    telephone_urgence VARCHAR(20) NOT NULL,
    matricule VARCHAR(50) NOT NULL,
    date_embauche DATE NOT NULL,
    poste VARCHAR(255) NOT NULL,
    departement VARCHAR(255) NOT NULL,
    superieur_id INT,
    type_contrat VARCHAR(50) NOT NULL,
    duree_contrat VARCHAR(50),
    periode_essai BOOLEAN NOT NULL,
    FOREIGN KEY (superieur_id) REFERENCES employe(id)
);


-- mise en place de la table manager

CREATE TABLE manager (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES employe(id)
);

-- mise en a jour de la table formation


Champ	Type	Null	Clé	Défaut	Description
id	int	NO	PRI	NULL	Identifiant unique de la formation (auto-incrément).
titre	varchar(255)	NO		NULL	Titre de la formation.
description	text	YES		NULL	Détails de la formation.
date_debut	date	NO		NULL	Date de début de la formation.
date_fin	date	NO		NULL	Date de fin de la formation (doit être >= date_debut).
manager_id	int	YES	MUL	NULL	Clé étrangère vers la table employes pour le responsable.
status	enum('en cours', 'terminée', 'non commencée')	YES		'non commencée'	Statut de la formation.
type	enum('présentiel', 'en ligne', 'hybride')	YES		NULL	Type de formation (présentiel, en ligne, hybride).
categorie	varchar(100)	YES		NULL	Catégorie de la formation (technique, soft skills, etc.).
max_participants	int	YES		NULL	Nombre maximum de participants autorisés.
evaluation	decimal(5,2)	YES		NULL	Évaluation moyenne de la formation (optionnel).
created_at	datetime	NO		CURRENT_TIMESTAMP	Date et heure de création de l’enregistrement.
updated_at	datetime	YES		NULL	Dernière date et heure de mise à jour.


-- table de liason pour la formation(formation_participation)


--  nouvelle table pour les evaluations
-- Table des évaluations
CREATE TABLE IF NOT EXISTS evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employe_id INT NOT NULL,
    evaluateur_id INT NOT NULL,
    type_evaluation ENUM('periodique', 'performance', 'objectifs', 'probation') NOT NULL,
    note_technique DECIMAL(3,1) NOT NULL,
    note_soft_skills DECIMAL(3,1) NOT NULL,
    objectifs_atteints BOOLEAN DEFAULT FALSE,
    commentaires TEXT,
    date_evaluation DATETIME NOT NULL,
    date_modification DATETIME,
    statut ENUM('en_attente', 'en_cours', 'complété', 'annulé') DEFAULT 'en_attente',
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluateur_id) REFERENCES employe(id)
);

-- Table historique des évaluations
CREATE TABLE IF NOT EXISTS historique_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id INT NOT NULL,
    employe_id INT NOT NULL,
    type_changement VARCHAR(50) NOT NULL,
    ancien_statut VARCHAR(50),
    nouveau_statut VARCHAR(50),
    date_changement DATETIME NOT NULL,
    commentaire TEXT,
    FOREIGN KEY (evaluation_id) REFERENCES  evaluation_candidat(id) ON DELETE CASCADE,
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE
);


-- nouveau employe
-- Ajout des colonnes pour l'authentification et les rôles
ALTER TABLE employe
ADD COLUMN role ENUM('ADMIN', 'MANAGER', 'EMPLOYE') DEFAULT 'EMPLOYE',
ADD COLUMN password VARCHAR(255),
ADD COLUMN date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


-- Table pour l'historique des modifications
CREATE TABLE IF NOT EXISTS historique_employe (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employe_id INT NOT NULL,
    type_modification VARCHAR(50),
    ancien_valeur TEXT,
    nouvelle_valeur TEXT,
    modifie_par INT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employe(id),
    FOREIGN KEY (modifie_par) REFERENCES employe(id)
);

-- Table pour les documents
CREATE TABLE IF NOT EXISTS documents_employe (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_document VARCHAR(50),
    chemin_fichier VARCHAR(255),
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employe_id INT,
    uploaded_by INT,
    FOREIGN KEY (employe_id) REFERENCES employe(id),
    FOREIGN KEY (uploaded_by) REFERENCES employe(id)
);

-- nouveau employe

-- Migration pour ajouter l'authentification et les rôles

-- Mise à jour de la table employes
ALTER TABLE employe
ADD COLUMN IF NOT EXISTS role ENUM('ADMIN', 'MANAGER', 'EMPLOYE') DEFAULT 'EMPLOYE',
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS derniere_connexion TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiration TIMESTAMP NULL;

-- Table pour l'historique des connexions
CREATE TABLE IF NOT EXISTS historique_connexions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employe_id INT NOT NULL,
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    statut ENUM('success', 'failed') NOT NULL,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
);

-- Table pour l'historique des modifications
CREATE TABLE IF NOT EXISTS historique_modifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employe_id INT NOT NULL,
    modifie_par INT NOT NULL,
    type_modification VARCHAR(50) NOT NULL,
    ancien_valeur TEXT,
    nouvelle_valeur TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE,
    FOREIGN KEY (modifie_par) REFERENCES employe(id)
);

-- Table pour les tokens d'authentification
CREATE TABLE IF NOT EXISTS auth_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employe_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (employe_id) REFERENCES employe(id) ON DELETE CASCADE
);

-- Index pour optimiser les recherches
CREATE INDEX idx_employe_email ON employes(email);
CREATE INDEX idx_employe_role ON employes(role);
CREATE INDEX idx_historique_date ON historique_modifications(date_modification);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);


-- keyapi sendcrid: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