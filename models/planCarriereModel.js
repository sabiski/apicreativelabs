const db = require('../config/database');

const planCarriereModel = {
    // Obtenir tous les plans de carrière
    getAllPlanCarriere: async () => {
        const [plans] = await db.query(`
            SELECT 
                e.id as employe_id,
                e.nom,
                e.prenom,
                e.poste as poste_actuel,
                e.departement as departement_actuel,
                MAX(hp.poste) as poste_cible,
                MAX(hp.departement) as departement_cible,
                MAX(hp.date_debut) as date_debut,
                MAX(hp.date_fin) as date_fin,
                MAX(ev.type_evaluation) as type_evaluation,
                MAX(ev.note_technique) as note_technique,
                MAX(ev.note_soft_skills) as note_soft_skills,
                MAX(ev.objectifs_atteints) as objectifs_atteints,
                GROUP_CONCAT(DISTINCT f.titre) as formations_en_cours
            FROM employe e
            LEFT JOIN historique_poste hp ON e.id = hp.employe_id
            LEFT JOIN evaluations ev ON e.id = ev.employe_id
            LEFT JOIN formation_participation fp ON e.id = fp.employe_id
            LEFT JOIN formation f ON fp.formation_id = f.id
            GROUP BY 
                e.id, 
                e.nom, 
                e.prenom, 
                e.poste, 
                e.departement
            ORDER BY e.nom, e.prenom`
        );
        return plans;
    },

    // Obtenir un plan de carrière spécifique
    getPlanCarriere: async (employeId) => {
        const [plan] = await db.query(`
            SELECT 
                e.id as employe_id,
                e.nom,
                e.prenom,
                e.poste as poste_actuel,
                e.departement as departement_actuel,
                hp.poste as poste_cible,
                hp.departement as departement_cible,
                hp.date_debut,
                hp.date_fin,
                ev.type_evaluation,
                ev.note_technique,
                ev.note_soft_skills,
                ev.objectifs_atteints,
                ev.commentaires as objectifs,
                ev.evaluateur_id,
                f.titre as formation_suivie,
                fp.date_participation as formation_date_debut,
                fp.status as statut_formation
            FROM employe e
            LEFT JOIN historique_poste hp ON e.id = hp.employe_id
            LEFT JOIN evaluations ev ON e.id = ev.employe_id
            LEFT JOIN formation_participation fp ON e.id = fp.employe_id
            LEFT JOIN formation f ON fp.formation_id = f.id
            WHERE e.id = ?
            ORDER BY hp.date_debut DESC, ev.date_evaluation DESC, fp.date_participation DESC
            LIMIT 1`,
            [employeId]
        );
        
        return plan;
    },

    // Créer un nouveau plan de carrière
    createPlanCarriere: async (planData) => {
        const { employe_id, objectifs, formations_prevues, poste_cible, evaluateur_id, departement } = planData;
        
        // Commencer une transaction
        await db.query('START TRANSACTION');
        
        try {
            // Insérer les objectifs dans la table evaluations
            const [evalResult] = await db.query(`
                INSERT INTO evaluations (
                    employe_id, 
                    evaluateur_id,
                    type_evaluation,
                    commentaires,
                    date_evaluation,
                    statut,
                    note_technique,
                    note_soft_skills
                ) VALUES (?, ?, 'objectifs', ?, NOW(), 'en_attente', 0, 0)`,
                [employe_id, evaluateur_id, objectifs]
            );

            // Insérer le poste cible dans historique_poste
            const [posteResult] = await db.query(`
                INSERT INTO historique_poste (
                    employe_id,
                    poste,
                    departement,
                    date_debut,
                    date_fin
                ) VALUES (?, ?, ?, CURDATE(), NULL)`,
                [employe_id, poste_cible, departement]
            );

            // Si des formations sont prévues, les ajouter
            if (formations_prevues && formations_prevues.length > 0) {
                for (const formation_id of formations_prevues) {
                    await db.query(`
                        INSERT INTO formation_participation (
                            employe_id,
                            formation_id,
                            date_participation,
                            status,
                            evaluation
                        ) VALUES (?, ?, CURDATE(), 'en cours', NULL)`,
                        [employe_id, formation_id]
                    );
                }
            }

            await db.query('COMMIT');

            return {
                employe_id,
                evaluation_id: evalResult.insertId,
                historique_poste_id: posteResult.insertId,
                objectifs,
                poste_cible,
                departement,
                formations_prevues
            };

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    },

    // Mettre à jour un plan de carrière
    updatePlanCarriere: async (employeId, planData) => {
        const { 
            poste_cible, 
            departement, 
            objectifs, 
            evaluateur_id,
            formations_prevues 
        } = planData;

        await db.query('START TRANSACTION');

        try {
            // 1. Mise à jour de l'historique des postes
            await db.query(`
                UPDATE historique_poste
                SET 
                    poste = ?,           /* au lieu de nouveau_poste */
                    departement = ?
                WHERE employe_id = ?
                ORDER BY date_debut DESC  /* au lieu de date_changement */
                LIMIT 1`,
                [poste_cible, departement, employeId]
            );

            // 2. Mise à jour ou création de l'évaluation
            const [existingEval] = await db.query(`
                SELECT id FROM evaluations 
                WHERE employe_id = ? AND type_evaluation = 'objectifs'
                ORDER BY date_evaluation DESC LIMIT 1`,
                [employeId]
            );

            if (existingEval && existingEval.length > 0) {
                await db.query(`
                    UPDATE evaluations 
                    SET 
                        commentaires = ?,
                        evaluateur_id = ?
                    WHERE id = ?`,
                    [objectifs, evaluateur_id, existingEval[0].id]
                );
            } else {
                await db.query(`
                    INSERT INTO evaluations (
                        employe_id,
                        evaluateur_id,
                        type_evaluation,
                        commentaires,
                        date_evaluation,
                        note_technique,
                        note_soft_skills,
                        objectifs_atteints
                    ) VALUES (?, ?, 'objectifs', ?, NOW(), 0, 0, 0)`,
                    [employeId, evaluateur_id, objectifs]
                );
            }

            // 3. Mise à jour des formations
            await db.query(`
                UPDATE formation_participation 
                SET status = 'annulée'
                WHERE employe_id = ? 
                AND status = 'en cours'`,
                [employeId]
            );

            if (formations_prevues && formations_prevues.length > 0) {
                for (const formation_id of formations_prevues) {
                    await db.query(`
                        INSERT INTO formation_participation (
                            employe_id,
                            formation_id,
                            date_participation,
                            status
                        ) VALUES (?, ?, CURDATE(), 'en cours')`,
                        [employeId, formation_id]
                    );
                }
            }

            await db.query('COMMIT');
            return { success: true };

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    },

    // Supprimer un plan de carrière
    deletePlanCarriere: async (employeId) => {
        await db.query('START TRANSACTION');
        
        try {
            // Supprimer les objectifs en attente
            await db.query(`
                DELETE FROM evaluations
                WHERE employe_id = ? 
                AND type_evaluation = 'objectifs'
                AND statut = 'en_attente'`,
                [employeId]
            );

            // Supprimer les formations planifiées
            await db.query(`
                DELETE FROM formation_participation
                WHERE employe_id = ? AND statut = 'planifie'`,
                [employeId]
            );

            // Marquer le dernier changement de poste comme annulé
            await db.query(`
                UPDATE historique_poste
                SET statut = 'annulé',
                    date_modification = NOW()
                WHERE employe_id = ?
                ORDER BY date_changement DESC
                LIMIT 1`,
                [employeId]
            );

            await db.query('COMMIT');
            return true;

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    },

    // Obtenir l'historique des évaluations
    getHistoriqueEvaluations: async (employeId) => {
        const [evaluations] = await db.query(`
            SELECT 
                date_evaluation,
                type_evaluation,
                note_technique,
                note_soft_skills,
                objectifs_atteints,
                commentaires,
                statut
            FROM evaluations
            WHERE employe_id = ?
            ORDER BY date_evaluation DESC`,
            [employeId]
        );
        return evaluations;
    },

    // Obtenir l'historique des formations
    getHistoriqueFormations: async (employeId) => {
        const [formations] = await db.query(`
            SELECT 
                f.titre,
                f.description,
                f.date_debut,
                f.date_fin,
                fp.statut
            FROM formation f
            JOIN formation_participation fp ON f.id = fp.formation_id
            WHERE fp.employe_id = ?
            ORDER BY f.date_debut DESC`,
            [employeId]
        );
        return formations;
    },

    // Obtenir l'historique des postes
    getHistoriquePostes: async (employeId) => {
        const [postes] = await db.query(`
            SELECT 
                ancien_poste,
                nouveau_poste,
                date_changement,
                raison_changement
            FROM historique_poste
            WHERE employe_id = ?
            ORDER BY date_changement DESC`,
            [employeId]
        );
        return postes;
    }
};

module.exports = planCarriereModel; 