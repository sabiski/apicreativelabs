const db = require('../config/database');

const Employe = {
    getAllEmployes: function(callback) {
        db.query('SELECT * FROM employe', callback);
    },

    getEmployeWithFormation: function(callback) {
        db.query(`
            SELECT e.*, f.titre as formation_titre, f.description as formation_description
            FROM employe e
            LEFT JOIN formations f ON e.id = f.employe_id
        `, callback);
    },

    getEmployeById: function(id, callback) {
        db.query('SELECT * FROM employe WHERE id = ?', [id], callback);
    },

    getEmployeByEmail: function(email, callback) {
        const query = `
            SELECT e.*, 
                   d.nom as departement_nom,
                   p.titre as poste_titre
            FROM employe e
            LEFT JOIN departements d ON e.departement = d.id
            LEFT JOIN postes p ON e.poste = p.id
            WHERE e.email = ? AND e.statut = 'actif'
        `;
        db.query(query, [email], callback);
    },

    createEmploye: function(employeData, callback) {
        const query = `
            INSERT INTO employe (
                nom, prenom, email, dateembauche, poste, 
                salairebase, telephone, photo, nomcontacturgence,
                telephonecontacturgence, relationcontacturgence, adresse,
                matricule, type_contrat, duree_contrat, periode_essai,
                statut, departement, role, password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            employeData.nom,
            employeData.prenom,
            employeData.email,
            employeData.dateembauche,
            employeData.poste,
            employeData.salairebase,
            employeData.telephone,
            employeData.photo,
            employeData.nomcontacturgence,
            employeData.telephonecontacturgence,
            employeData.relationcontacturgence,
            employeData.adresse,
            employeData.matricule,
            employeData.type_contrat,
            employeData.duree_contrat,
            employeData.periode_essai,
            employeData.statut,
            employeData.departement,
            employeData.role,
            employeData.password
        ];

        db.query(query, values, callback);
    },

    isEmployeInDepartement: function(employeId, managerId, callback) {
        const query = `
            SELECT COUNT(*) as count
            FROM employe e1
            JOIN employe e2 ON e1.departement = e2.departement
            WHERE e1.id = ? AND e2.id = ? AND e2.role = 'MANAGER'
        `;
        db.query(query, [employeId, managerId], (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results[0].count > 0);
            }
        });
    },

    updatePassword: function(employeId, hashedPassword, callback) {
        const query = `
            UPDATE employe
            SET password = ?,
                date_modification = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        db.query(query, [hashedPassword, employeId], callback);
    },

    getEmployeStats: function(callback) {
        const query = `
            SELECT 
                COUNT(*) as total_employes,
                COUNT(CASE WHEN role = 'MANAGER' THEN 1 END) as total_managers,
                COUNT(CASE WHEN statut = 'actif' THEN 1 END) as actifs,
                COUNT(CASE WHEN statut = 'inactif' THEN 1 END) as inactifs,
                AVG(salairebase) as salaire_moyen,
                COUNT(CASE WHEN DATEDIFF(CURRENT_DATE, dateembauche) < 365 THEN 1 END) as nouveaux_employes
            FROM employe
        `;
        db.query(query, callback);
    },

    getEmployeHistory: function(employeId, callback) {
        const query = `
            SELECT 
                h.*,
                CONCAT(e.nom, ' ', e.prenom) as modifie_par
            FROM historique_employe h
            LEFT JOIN employe e ON h.modifie_par = e.id
            WHERE h.employe_id = ?
            ORDER BY h.date_modification DESC
        `;
        db.query(query, [employeId], callback);
    },

    getEmployeDocuments: function(employeId, callback) {
        const query = `
            SELECT *
            FROM documents_employe
            WHERE employe_id = ?
            ORDER BY date_upload DESC
        `;
        db.query(query, [employeId], callback);
    },

    addDocument: function(documentData, callback) {
        const query = `
            INSERT INTO documents_employe (
                type_document, chemin_fichier, date_upload,
                employe_id, uploaded_by
            ) VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)
        `;
        const values = [
            documentData.type_document,
            documentData.chemin_fichier,
            documentData.employe_id,
            documentData.uploaded_by
        ];
        db.query(query, values, callback);
    },

    updateEmploye: function(id, updatedEmploye, callback) {
        db.query('UPDATE employe SET ? WHERE id = ?', [updatedEmploye, id], callback);
    },

    deleteEmploye: function(id, callback) {
        db.query('DELETE FROM employe WHERE id = ?', [id], callback);
    },

    deleteRelatedRecords: function(employeId, callback) {
        const queries = [
            'DELETE FROM blame WHERE employeid = ?',
            'DELETE FROM conge WHERE employeid = ?',
            'DELETE FROM contrat WHERE employeid = ?',
            'DELETE FROM documents_employe WHERE employe_id = ?',
            'DELETE FROM formation WHERE employeid = ? ',
            'DELETE FROM historique_poste WHERE employe_id = ?',
            'DELETE FROM historique_statut WHERE employe_id = ?',
            'DELETE FROM paie WHERE employeid = ?',
            'DELETE FROM pointage WHERE employeid = ?',
            'DELETE FROM presence_absence WHERE employeid = ?',
            'DELETE FROM recrutement WHERE employe_id = ?'
        ];

        const tasks = queries.map(query => {
            return new Promise((resolve, reject) => {
                db.query(query, [employeId, employeId], (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            });
        });

        Promise.all(tasks)
            .then(results => callback(null, results))
            .catch(err => callback(err, null));
    },

    getAllContrats: function(callback) {
        db.query('SELECT * FROM contrat', callback);
    },

    getContratById: function(id, callback) {
        db.query('SELECT * FROM contrat WHERE id = ?', [id], callback);
    },

    createContrat: function(newContrat, callback) {
        db.query('INSERT INTO Contrat SET ?', newContrat, callback);
    },

    updatedContrat: function(id, updatedContrat, callback) {
        db.query('UPDATE contrat SET ? WHERE id = ?', [updatedContrat, id], callback);
    },

    deleteContrat: function(id, callback) {
        db.query('DELETE FROM contrat WHERE id = ?', [id], callback);
    },

    getAllConges: function(callback) {
        db.query('SELECT * FROM conge', callback);
    },

    getCongeById: function(id, callback) {
        db.query('SELECT * FROM conge WHERE id = ?', [id], callback);
    },

    createConge: function(newConge, callback) {
        db.query('INSERT INTO Conge SET ?', newConge, callback);
    },

    updatedConge: function(id, updatedConge, callback) {
        db.query('UPDATE conge SET ? WHERE id = ?', [updatedConge, id], callback);
    },

    deleteConge: function(id, callback) {
        db.query('DELETE FROM conge WHERE id = ?', [id], callback);
    },

    getAllPaie: function(callback) {
        db.query('SELECT * FROM paie', callback);
    },

    getPaieById: function(id, callback) {
        db.query('SELECT * FROM paie WHERE id = ?', [id], callback);
    },

    createPaie: function(newConge, callback) {
        db.query('INSERT INTO paie SET ?', newConge, callback);
    },

    updatedPaie: function(id, updatedConge, callback) {
        db.query('UPDATE paie SET ? WHERE id = ?', [updatedConge, id], callback);
    },

    deletePaie: function(id, callback) {
        db.query('DELETE FROM paie WHERE id = ?', [id], callback);
    },

    getAllPointages: function(callback) {
        db.query('SELECT * FROM pointage', callback);
    },

    getPointageById: function(id, callback) {
        db.query('SELECT * FROM pointage WHERE id = ?', [id], callback);
    },

    createPointage: function(newPointage, callback) {
        db.query('INSERT INTO pointage SET ?', newPointage, callback);
    },

    updatedPointage: function(id, updatedConge, callback) {
        db.query('UPDATE pointage SET ? WHERE id = ?', [updatedConge, id], callback);
    },

    deletePointage: function(id, callback) {
        db.query('DELETE FROM pointage WHERE id = ?', [id], callback);
    },

    getAllFormations: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM formation');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getFormationById: async (id) => {
        try {
            const [rows] = await db.query('SELECT * FROM formation WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    createFormation: async (formationData) => {
        try {
            const [result] = await db.query('INSERT INTO formation SET ?', [formationData]);
            return result;
        } catch (error) {
            throw error;
        }
    },

    updateFormation: async (id, formationData) => {
        try {
            const [result] = await db.query('UPDATE formation SET ? WHERE id = ?', [formationData, id]);
            return result;
        } catch (error) {
            throw error;
        }
    },

    deleteFormation: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM formation WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    },

    getAllPresenceAbsences: function(callback) {
        db.query('SELECT * FROM  presence_absence', callback);
    },

    getPresenceAbsenceById: function(id, callback) {
        db.query('SELECT * FROM presence_absence WHERE id = ?', [id], callback);
    },

    createPresenceAbsence: function(newpresence_absence, callback) {
        db.query('INSERT INTO presence_absence SET ?', newpresence_absence, callback);
    },

    updatedPresenceAbsence: function(id, updatedPresence_absence, callback) {
        db.query('UPDATE presence_absence SET ? WHERE id = ?', [updatedPresence_absence, id], callback);
    },

    deletePresenceAbsence: function(id, callback) {
        db.query('DELETE FROM presence_absence WHERE id = ?', [id], callback);
    },

    getAllBlames: function(callback) {
        db.query('SELECT * FROM  blame', callback);
    },

    getBlameById: function(id, callback) {
        db.query('SELECT * FROM blame WHERE id = ?', [id], callback);
    },

    createBlame: function(newblame, callback) {
        db.query('INSERT INTO  blame SET ?', newblame, callback);
    },

    updatedBlame: function(id, updatedblame, callback) {
        db.query('UPDATE blame SET ? WHERE id = ?', [updatedblame, id], callback);
    },

    deleteBlame: function(id, callback) {
        db.query('DELETE FROM blame  WHERE id = ?', [id], callback);
    },

    getAllHistoriquePostes: function(callback) {
        db.query('SELECT * FROM  historique_poste', callback);
    },

    getHistoriquePosteById: function(id, callback) {
        db.query('SELECT * FROM historique_poste WHERE id = ?', [id], callback);
    },

    createHistoriquePoste: function(newhistorique_poste, callback) {
        db.query('INSERT INTO  historique_poste SET ?', newhistorique_poste, callback);
    },

    updatedHistoriquePoste: function(id, updatedhistorique_poste, callback) {
        db.query('UPDATE historique_poste SET ? WHERE id = ?', [updatedhistorique_poste, id], callback);
    },

    deleteHistoriquePoste: function(id, callback) {
        db.query('DELETE FROM historique_poste  WHERE id = ?', [id], callback);
    },

    getAllHistoriqueStatuts: function(callback) {
        db.query('SELECT * FROM  historique_statut', callback);
    },

    getHistoriqueStatutById: function(id, callback) {
        db.query('SELECT * FROM historique_statut WHERE id = ?', [id], callback);
    },

    createHistoriqueStatut: function(newhistorique_statut, callback) {
        db.query('INSERT INTO  historique_statut SET ?', newhistorique_statut, callback);
    },

    updatedHistoriqueStatut: function(id, updatedhistorique_statut, callback) {
        db.query('UPDATE historique_statut SET ? WHERE id = ?', [updatedhistorique_statut, id], callback);
    },

    deleteHistoriqueStatut: function(id, callback) {
        db.query('DELETE FROM historique_statut  WHERE id = ?', [id], callback);
    },

    getAllDocumentsEmployes: function(callback) {
        db.query('SELECT * FROM  documents_employe', callback);
    },

    getDocumentsEmployeById: function(id, callback) {
        db.query('SELECT * FROM documents_employe WHERE id = ?', [id], callback);
    },

    createDocumentsEmploye: function(newdocuments_employe, callback) {
        db.query('INSERT INTO  documents_employe SET ?', newdocuments_employe, callback);
    },

    updatedDocumentsEmploye: function(id, updateddocuments_employe, callback) {
        db.query('UPDATE documents_employe SET ? WHERE id = ?', [updateddocuments_employe, id], callback);
    },

    deleteDocumentsEmploye: function(id, callback) {
        db.query('DELETE FROM documents_employe  WHERE id = ?', [id], callback);
    },

    getEmployesByDepartement: function(departement, callback) {
        const query = `
            SELECT e.*, 
                   d.nom as departement_nom,
                   p.titre as poste_titre
            FROM employe e
            LEFT JOIN departements d ON e.departement = d.id
            LEFT JOIN postes p ON e.poste = p.id
            WHERE e.departement = ?
            ORDER BY e.nom, e.prenom
        `;
        
        db.query(query, [departement], callback);
    },

    updateLastLogin: function(id, callback) {
        const query = `
            UPDATE employe
            SET derniere_connexion = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        db.query(query, [id], callback);
    }
};

module.exports = Employe;



