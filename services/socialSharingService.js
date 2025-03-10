const axios = require('axios');
const entrepriseConfigService = require('./entrepriseConfigService');

class SocialSharingService {
    async shareToLinkedIn(offreData, entrepriseId) {
        try {
            const config = await entrepriseConfigService.getConfig(entrepriseId, 'linkedin');
            
            if (!config.access_token || !config.company_id) {
                throw new Error('Configuration LinkedIn manquante');
            }

            const linkedInApiUrl = 'https://api.linkedin.com/v2/shares';
            const postData = {
                owner: `urn:li:organization:${config.company_id}`,
                subject: offreData.titre,
                text: {
                    text: this.formatLinkedInText(offreData, config)
                }
            };

            await axios.post(linkedInApiUrl, postData, {
                headers: {
                    'Authorization': `Bearer ${config.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            return true;
        } catch (error) {
            console.error('Erreur LinkedIn:', error);
            throw error;
        }
    }

    async shareToTwitter(offreData, entrepriseId) {
        try {
            const config = await entrepriseConfigService.getConfig(entrepriseId, 'twitter');
            
            if (!config.api_key || !config.api_secret) {
                throw new Error('Configuration Twitter manquante');
            }

            // Configuration Twitter avec les données de l'entreprise
            const twitterClient = new Twitter({
                consumer_key: config.api_key,
                consumer_secret: config.api_secret,
                access_token_key: config.access_token,
                access_token_secret: config.access_secret
            });

            const tweet = this.formatTwitterText(offreData, config);
            await twitterClient.post('tweets', { text: tweet });
            return true;
        } catch (error) {
            console.error('Erreur Twitter:', error);
            throw error;
        }
    }

    async updateWebsite(offreData, entrepriseId) {
        try {
            const config = await entrepriseConfigService.getConfig(entrepriseId, 'website');
            
            if (!config.api_url || !config.api_key) {
                throw new Error('Configuration du site web manquante');
            }

            await axios.post(`${config.api_url}/carrieres`, offreData, {
                headers: {
                    'Authorization': `Bearer ${config.api_key}`
                }
            });

            return true;
        } catch (error) {
            console.error('Erreur mise à jour site web:', error);
            throw error;
        }
    }

    // Méthodes utilitaires pour formater le texte
    formatLinkedInText(offreData, config) {
        return `${config.message_template || ''}
                ${offreData.description}
                
                Compétences requises: ${offreData.competences_requises}
                Lieu: ${offreData.lieu_travail}
                
                Postulez maintenant: ${config.website_url}/carrieres/${offreData.id}`;
    }

    formatTwitterText(offreData, config) {
        return `${config.tweet_template || 'Nouvelle offre:'} ${offreData.titre}
                
                Plus d'infos: ${config.website_url}/carrieres/${offreData.id}
                ${config.hashtags || '#Recrutement #Emploi'}`;
    }
}

module.exports = new SocialSharingService(); 