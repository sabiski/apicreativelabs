const nodemailer = require('nodemailer');
require('dotenv').config();

// Créer un transporteur pour l'envoi d'emails
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey', // Cette valeur est toujours 'apikey'
        pass: process.env.SENDGRID_API_KEY
    }
});

// Templates d'emails
const emailTemplates = {
    entretienInvitation: (data) => ({
        subject: "Invitation à un entretien",
        html: `
            <h2>Invitation à un entretien</h2>
            <p>Bonjour,</p>
            <p>Nous avons le plaisir de vous inviter à un entretien pour le poste.</p>
            <p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>
            <p><strong>Type d'entretien:</strong> ${data.type}</p>
            ${data.lien ? `<p><strong>Lien de réunion:</strong> <a href="${data.lien}">${data.lien}</a></p>` : ''}
            <p>Cordialement,<br>L'équipe de recrutement</p>
        `
    }),

    candidatureReception: (data) => ({
        subject: "Confirmation de réception de votre candidature",
        html: `
            <h2>Confirmation de réception</h2>
            <p>Bonjour ${data.nom},</p>
            <p>Nous confirmons la bonne réception de votre candidature pour le poste de ${data.poste}.</p>
            <p>Nous étudierons votre dossier avec attention et reviendrons vers vous dans les meilleurs délais.</p>
            <p>Cordialement,<br>L'équipe de recrutement</p>
        `
    }),

    candidatureStatutUpdate: (data) => ({
        subject: "Mise à jour de votre candidature",
        html: `
            <h2>Mise à jour de votre candidature</h2>
            <p>Bonjour ${data.nom},</p>
            <p>${data.message}</p>
            <p>Cordialement,<br>L'équipe de recrutement</p>
        `
    }),

    offreEmploi: (data) => ({
        subject: `Nouvelle offre d'emploi : ${data.titre}`,
        html: `
            <h2>${data.titre}</h2>
            <p>${data.description}</p>
            <h3>Compétences requises :</h3>
            <p>${data.competences_requises}</p>
            <h3>Lieu de travail :</h3>
            <p>${data.lieu_travail}</p>
            <p><strong>Date limite de candidature :</strong> ${new Date(data.date_limite).toLocaleDateString()}</p>
            <p>Pour postuler, cliquez <a href="${data.lien_candidature}">ici</a></p>
        `
    }),

    initialPassword: (data) => ({
        subject: "Configuration de votre compte",
        html: `
            <h2>Bienvenue ${data.prenom} ${data.nom}</h2>
            <p>Votre compte a été créé avec succès.</p>
            <p>Pour configurer votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
            <p><a href="http://localhost:5500/reset-password.html?token=${data.resetToken}">Configurer mon mot de passe</a></p>
            <p>Ce lien est valable pendant 24 heures.</p>
            <p>Vos identifiants :</p>
            <ul>
                <li>Email : ${data.email}</li>
                <li>Matricule : ${data.matricule}</li>
            </ul>
            <p>Cordialement,<br>L'équipe RH</p>
        `
    }),
};

const emailService = {
    sendEmail: async (to, subject, htmlContent) => {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'your-verified-sender@your-domain.com',
                to: to,
                subject: subject,
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email envoyé: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            throw error;
        }
    },

    // Méthodes spécifiques pour chaque type d'email
    sendEntretienInvitation: async (candidat, entretienData) => {
        return emailService.sendEmail(
            candidat.email,
            'entretienInvitation',
            emailTemplates.entretienInvitation(entretienData).html
        );
    },

    sendCandidatureConfirmation: async (candidat, posteData) => {
        return emailService.sendEmail(
            candidat.email,
            'candidatureReception',
            emailTemplates.candidatureReception({
                nom: candidat.nom,
                poste: posteData.titre
            }).html
        );
    },

    sendStatutUpdate: async (candidat, statutData) => {
        return emailService.sendEmail(
            candidat.email,
            'candidatureStatutUpdate',
            emailTemplates.candidatureStatutUpdate({
                nom: candidat.nom,
                message: statutData.message
            }).html
        );
    },

    sendNewOffreEmail: async (subscribers, offreData) => {
        const sendPromises = subscribers.map(subscriber => 
            emailService.sendEmail(
                subscriber.email,
                'offreEmploi',
                emailTemplates.offreEmploi(offreData).html
            )
        );
        return Promise.all(sendPromises);
    }
};

module.exports = emailService; 