import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateProfile } from '../services/authService';

const LanguageContext = createContext(null);

const translations = {
  en: {
    // Auth & Register
    createAccount: 'Create an account',
    joinCommunity: 'Join the intergenerational community.',
    backToSignIn: 'Back to sign in',
    yourIdentity: 'Your identity',
    senior: 'Senior',
    youth: 'Youth',
    profilePicture: 'Profile picture',
    uploadPhoto: 'Upload photo',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    emailAddress: 'Email Address',
    emailPlaceholder: 'name@archive.com',
    password: 'Password',
    passwordPlaceholder: 'Min. 8 characters',
    prefLanguage: 'Preferred Language',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    age: 'Age',
    agePlaceholder: 'e.g. 24 or 65',
    wantToLearn: 'I want to learn (comma separated)',
    wantToLearnPlaceholder: 'e.g. History, Sociology, Arts',
    whatITeach: 'I can share/teach (comma separated)',
    whatITeachPlaceholder: 'e.g. Traditional Crafts, Tech',
    completeProfile: 'Complete your profile',
    tellUsAboutYourself: 'Tell us a bit about yourself to personalize your experience.',
    continueToDashboard: 'Continue to dashboard',
    saving: 'Saving...',
    
    // Niche fields select for seniors
    selectTeachInterests: 'Select up to 5 niche fields you can teach:',
    selectLearnInterests: 'Select up to 5 niche fields you want to learn:',
    history: 'History',
    sociology: 'Sociology',
    anthropology: 'Anthropology',
    philosophy: 'Philosophy',
    literature: 'Literature',

    // Dashboard
    feed: 'Home',
    messages: 'Messages',
    create: 'Create',
    library: 'Library',
    live: 'Live',
    profile: 'Profile',
    signOut: 'Sign out',
    rootPoints: 'Root Points',
    engagementValue: 'Your engagement creates value.',
    points: 'Points',
    badges: 'Badges',
    leaderboard: 'Leaderboard',
    connectionRequests: 'Connection Requests',
    recommendations: 'Recommendations',
    suggestedConnections: 'Suggested Connections',
    compatibilityScore: 'Match',
    youCanLearn: 'You can learn',
    theyCanLearn: 'They can learn',
    reciprocalMatch: 'Reciprocal learning',
    connect: 'Connect',
    connectionSent: 'Connection request sent!',
    accept: 'Accept',
    reject: 'Reject',
    searchPlaceholder: 'Search your feed, library, and connections',
    createPostPlaceholder: 'Share something with the community...',
    publish: 'Publish',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    rate: 'Rate',
    noRecommendations: 'No matching connections found yet.',
    noRequests: 'No pending requests.',
    noFeed: 'Your feed is ready for real content',
    noFeedSub: 'Connect with matches, share stories, and earn root points.',
    uploadFirstStory: 'Upload first story',
    earnedBadges: 'Earned Badges',
    communityMember: 'Community member',
    findMentor: 'Find Mentor',
    findMentorSub: 'Browse by skill',
    findMentorDesc: 'Browse people by skill and connect with a mentor or mentee.',
    wisdomHub: 'Wisdom Hub',
    wisdomHubSub: 'Browse archive',
    wisdomHubDesc: 'Browse the community wisdom archive. Watch, read, and rate content.',
    contribute: 'Contribute',
    contributeSub: 'Share a story',
    community: 'Community',
    communitySub: 'Events & more',
    quickActions: 'Quick Actions',
    noWisdomYet: 'No wisdom archived yet',
    noWisdomYetSub: 'Be the first to contribute a story or voice archive to the community.',
    
    // Chat Messaging
    chatTitle: 'Messages',
    chatSubtitle: 'Real-time text and voice messaging',
    websocketReady: 'WebSocket ready',
    threads: 'Threads',
    noConvYet: 'No conversations yet',
    noConvYetSub: 'Accepted connections will appear here so you can chat.',
    selectThread: 'Select a thread',
    selectThreadSub: 'Select a participant to start talking.',
    typeMessage: 'Type a message...',
    voiceNote: 'Voice note',
    sending: 'sending',
    sent: 'sent',
    imageSent: 'Sent an image',
    recordVoice: 'Record voice note',
    stopRecording: 'Stop recording',
    attachFile: 'Attach image',

    // Recording Session / Senior UX Archive
    memoryArchive: 'Memory Archive & Transcription Center',
    voiceSignalsTitle: 'Archive & Transcribe',
    micCapture: 'Capture Voice signals',
    visualizerLabel: 'Active voice signal canvas analysis',
    liveTranscription: 'Live AI Transcription',
    reviewTranscript: 'Review and edit transcript:',
    publishToArchive: 'Publish to Archive & Feed',
    storyUpload: 'Story upload',
    createStory: 'Create a story',
    createStorySub: 'Record your voice or upload vertical videos/images to share intergenerational wisdom.',
    archiveTitle: 'Knowledge library',
    noStoriesYet: 'No uploaded stories yet',
    noStoriesYetSub: 'Your saved voice archives and memory stories will appear here.',
    voice: 'Voice',
    upload: 'Upload',
  },
  fr: {
    // Auth & Register
    createAccount: 'Créer un compte',
    joinCommunity: 'Rejoignez la communauté intergénérationnelle.',
    backToSignIn: 'Retour à la connexion',
    yourIdentity: 'Votre identité',
    senior: 'Aîné(e)',
    youth: 'Jeune',
    profilePicture: 'Photo de profil',
    uploadPhoto: 'Télécharger une photo',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Votre nom complet',
    emailAddress: 'Adresse e-mail',
    emailPlaceholder: 'nom@archive.com',
    password: 'Mot de passe',
    passwordPlaceholder: 'Min. 8 caractères',
    prefLanguage: 'Langue préférée',
    creatingAccount: 'Création du compte...',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se connecter',
    age: 'Âge',
    agePlaceholder: 'ex. 24 ou 65',
    wantToLearn: 'Je veux apprendre (séparé par des virgules)',
    wantToLearnPlaceholder: 'ex. Histoire, Sociologie, Arts',
    whatITeach: 'Je peux partager/enseigner (séparé par des virgules)',
    whatITeachPlaceholder: 'ex. Artisanat traditionnel, Tech',
    completeProfile: 'Complétez votre profil',
    tellUsAboutYourself: 'Parlez-nous un peu de vous pour personnaliser votre expérience.',
    continueToDashboard: 'Continuer vers le tableau de bord',
    saving: 'Enregistrement...',

    // Niche fields select for seniors
    selectTeachInterests: 'Sélectionnez jusqu\'à 5 domaines de spécialité à enseigner :',
    selectLearnInterests: 'Sélectionnez jusqu\'à 5 domaines de spécialité à apprendre :',
    history: 'Histoire',
    sociology: 'Sociologie',
    anthropology: 'Anthropologie',
    philosophy: 'Philosophie',
    literature: 'Littérature',

    // Dashboard
    feed: 'Accueil',
    messages: 'Messages',
    create: 'Créer',
    library: 'Bibliothèque',
    live: 'En direct',
    profile: 'Profil',
    signOut: 'Se déconnecter',
    rootPoints: 'Points de Racine',
    engagementValue: 'Votre engagement crée de la valeur.',
    points: 'Points',
    badges: 'Badges',
    leaderboard: 'Classement',
    connectionRequests: 'Demandes de connexion',
    recommendations: 'Recommandations',
    suggestedConnections: 'Connexions suggérées',
    compatibilityScore: 'Compatibilité',
    youCanLearn: 'Vous pouvez apprendre',
    theyCanLearn: 'Peut apprendre',
    reciprocalMatch: 'Apprentissage réciproque',
    connect: 'Se connecter',
    connectionSent: 'Demande de connexion envoyée !',
    accept: 'Accepter',
    reject: 'Refuser',
    searchPlaceholder: 'Rechercher dans votre fil, bibliothèque et connexions',
    createPostPlaceholder: 'Partagez quelque chose avec la communauté...',
    publish: 'Publier',
    like: 'Aimer',
    comment: 'Commenter',
    share: 'Partager',
    rate: 'Évaluer',
    noRecommendations: 'Aucune recommandation trouvée.',
    noRequests: 'Aucune demande en attente.',
    noFeed: 'Votre fil est prêt pour du contenu réel',
    noFeedSub: 'Connectez-vous avec des aînés/jeunes et partagez vos histoires.',
    uploadFirstStory: 'Publier votre première histoire',
    earnedBadges: 'Badges obtenus',
    communityMember: 'Membre de la communauté',
    findMentor: 'Trouver un mentor',
    findMentorSub: 'Parcourir par compétence',
    findMentorDesc: 'Parcourez les profils par compétence et connectez-vous avec un mentor.',
    wisdomHub: 'Hub de Sagesse',
    wisdomHubSub: 'Parcourir les archives',
    wisdomHubDesc: 'Parcourez les archives de sagesse. Regardez, lisez et évaluez le contenu.',
    contribute: 'Contribuer',
    contributeSub: 'Partager une histoire',
    community: 'Communauté',
    communitySub: 'Événements et plus',
    quickActions: 'Actions rapides',
    noWisdomYet: 'Aucune sagesse archivée',
    noWisdomYetSub: 'Soyez le premier à contribuer une histoire ou un enregistrement vocal.',

    // Chat Messaging
    chatTitle: 'Messages',
    chatSubtitle: 'Messagerie texte et vocale en temps réel',
    websocketReady: 'WebSocket connecté',
    threads: 'Discussions',
    noConvYet: 'Aucune conversation',
    noConvYetSub: 'Les connexions acceptées apparaîtront ici pour discuter.',
    selectThread: 'Sélectionnez une discussion',
    selectThreadSub: 'Choisissez un participant pour commencer à parler.',
    typeMessage: 'Écrivez un message...',
    voiceNote: 'Note vocale',
    sending: 'envoi...',
    sent: 'envoyé',
    imageSent: 'A envoyé une image',
    recordVoice: 'Enregistrer une note vocale',
    stopRecording: 'Arrêter l\'enregistrement',
    attachFile: 'Joindre une image',

    // Recording Session / Senior UX Archive
    memoryArchive: 'Archives de Mémoire et Centre de Transcription',
    voiceSignalsTitle: 'Enregistrer & Transcrire',
    micCapture: 'Capturer les signaux vocaux',
    visualizerLabel: 'Analyse dynamique du signal vocal sur canevas',
    liveTranscription: 'Transcription IA en direct',
    reviewTranscript: 'Vérifier et modifier la transcription :',
    publishToArchive: 'Publier dans les Archives et le Fil',
    storyUpload: 'Partage d\'histoire',
    createStory: 'Créer une histoire',
    createStorySub: 'Enregistrez votre voix ou téléchargez des vidéos/images pour partager la sagesse intergénérationnelle.',
    archiveTitle: 'Bibliothèque de savoirs',
    noStoriesYet: 'Aucune histoire publiée',
    noStoriesYetSub: 'Vos enregistrements vocaux et histoires apparaîtront ici.',
    voice: 'Voix',
    upload: 'Fichier',
  }
};

export function LanguageProvider({ children }) {
  const { appUser } = useAuth();
  const [language, setLanguage] = useState('en');

  // Load user default language when user state changes
  useEffect(() => {
    if (appUser && appUser.language) {
      setLanguage(appUser.language);
    }
  }, [appUser]);

  const changeLanguage = async (newLang) => {
    if (newLang !== 'en' && newLang !== 'fr') return;
    setLanguage(newLang);
    
    // Persist to database if user is authenticated
    if (appUser) {
      try {
        await updateProfile({ language: newLang });
      } catch (err) {
        console.error('Failed to save language setting to profile:', err);
      }
    }
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
