// Site config — teammates: edit LINKS, NAV_ITEMS, or TEXT here only.

const LINKS = {
  home: 'index.html',
  learning: '../../operation-red-rock/learning.html',
  challenges: '../../operation-red-rock/index.html#challenges',
  game: '../../operation-red-rock/index.html',                 // Operation Red Rock Game / Home
  quiz: '../../operation-red-rock/learning.html',             // Card 1: Challenge / Test your knowledge -> Operation Red Rock Learning
  rovers: '../../operation-red-rock/index.html',              // Card 2: Choose your rover -> Operation Red Rock Home
  articles: '#'                                               // Card 3: Read articles
};

// Add one line here to add a new page to the header and footer:
const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: LINKS.home },
  { id: 'learning', label: 'Learning', href: LINKS.learning },
  { id: 'challenges', label: 'Challenges', href: LINKS.challenges },
  { id: 'game', label: 'Game', href: LINKS.game, isAccent: true }
];

const TEXT = {
  siteName: 'OPERATION RED ROCK',
  tagline: 'Earth sites that prepare us for the Red Planet.',
  heroTitle: 'Learn how analogs prepare us for Mars',
  heroSubtitle: 'Explore places on Earth that look like Mars, and learn how scientists and rovers use them.',
  heroButton: 'Start learning',
  scrollHint: 'Scroll',
  stepsHeading: 'How it works',
  steps: [
    {
      number: '1',
      icon: 'quiz',
      title: 'Challenge your knowledge',
      description: 'Take short quizzes and learn how to choose the right rover for every mission.',
      buttonText: 'Take a quiz',
      href: LINKS.quiz
    },
    {
      number: '2',
      icon: 'rover',
      title: 'Choose the right rover for the right mission',
      description: 'Compare rovers and match each one to the mission it can handle.',
      buttonText: 'Choose a rover',
      href: LINKS.rovers
    },
    {
      number: '3',
      icon: 'articles',
      title: 'Read articles',
      description: 'Short, easy articles about places on Mars and the Earth sites that look like them.',
      buttonText: 'Read articles',
      href: LINKS.articles
    }
  ],
  gameBand: {
    text: 'Ready to try it? Train a robot on Earth, then complete a mission on Mars.',
    buttonText: 'Play the game',
    href: LINKS.game
  },
  footer: {
    notice: 'Educational project. Not affiliated with or endorsed by NASA.'
  },
  comingSoon: 'Coming soon',
  pages: {
    learning: {
      heading: 'Learning',
      badge: 'Coming soon',
      message: 'Interactive lessons and analog site guides are on the way. Check back soon to explore Earth and Mars side by side.',
      backText: 'Back to home'
    },
    challenges: {
      heading: 'Challenges',
      badge: 'Coming soon',
      message: 'Quizzes will appear here',
      backText: 'Back to home'
    }
  }
};
