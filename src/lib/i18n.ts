import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app.title": "Sacred Trails Planner",
      "nav.home": "Home",
      "nav.temples": "Temples",
      "nav.plan": "Plan Yatra",
      "nav.profile": "My Profile",
      "nav.saved": "Saved Trips",
      "nav.logout": "Log out",
      "nav.signin": "Sign In",
      "nav.welcome": "Welcome",
      "hero.title": "Plan Your Divine Journey",
      "hero.subtitle": "Discover sacred temples, optimize routes, and create personalized spiritual itineraries with AI.",
      "hero.cta": "Start Planning",
      "planner.title": "AI Yatra Planner",
      "planner.subtitle": "Tell us where you want to go, and let AI craft the perfect pilgrimage itinerary.",
      "planner.inputPlaceholder": "E.g., I have 4 days from Delhi to visit Kedarnath...",
      "planner.generateBtn": "Generate Route",
      "planner.generatingBtn": "Generating Divine Path...",
    }
  },
  hi: {
    translation: {
      "app.title": "पवित्र यात्रा योजनाकार",
      "nav.home": "होम",
      "nav.temples": "मंदिर",
      "nav.plan": "यात्रा की योजना बनाएं",
      "nav.profile": "मेरी प्रोफ़ाइल",
      "nav.saved": "सहेजी गई यात्राएं",
      "nav.logout": "लॉग आउट",
      "nav.signin": "साइन इन करें",
      "nav.welcome": "स्वागत है",
      "hero.title": "अपनी दिव्य यात्रा की योजना बनाएं",
      "hero.subtitle": "पवित्र मंदिरों की खोज करें, मार्गों को अनुकूलित करें और AI के साथ व्यक्तिगत आध्यात्मिक यात्रा कार्यक्रम बनाएं।",
      "hero.cta": "योजना बनाना शुरू करें",
      "planner.title": "AI यात्रा योजनाकार",
      "planner.subtitle": "हमें बताएं कि आप कहाँ जाना चाहते हैं, और AI को सही तीर्थयात्रा कार्यक्रम तैयार करने दें।",
      "planner.inputPlaceholder": "उदाहरण: मेरे पास दिल्ली से केदारनाथ जाने के लिए 4 दिन हैं...",
      "planner.generateBtn": "मार्ग बनाएं",
      "planner.generatingBtn": "दिव्य मार्ग बनाया जा रहा है...",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
