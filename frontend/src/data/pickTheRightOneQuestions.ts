import { ImageSourcePropType } from 'react-native';

export type PictureChoice = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

export type PictureQuestion = {
  id: string;
  question: string;
  choices: PictureChoice[];
  correctChoiceId: string;
  incorrectExplanation: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

/**
 * Add the supplied questions and static `require(...)` image references here.
 * Each question must have exactly 2 or 3 choices and a matching correctChoiceId.
 */
export const pictureQuestions: PictureQuestion[] = [
  {
    id: 'regular-dentist-visits',
    question: 'Which picture shows a healthy dentist visit?',
    choices: [
      {
        id: 'missed-dentist-visit',
        label: 'Not visiting the dentist',
        image: require('../../assets/images/quick-pick-dentist-missed.png')
      },
      {
        id: 'dentist-every-six-months',
        label: 'Visiting the dentist',
        image: require('../../assets/images/quick-pick-dentist-visit.png')
      },
      {
        id: 'dentist-with-toothache',
        label: 'Waiting for a toothache',
        image: require('../../assets/images/quick-pick-dentist-toothache.png')
      }
    ],
    correctChoiceId: 'dentist-every-six-months',
    incorrectExplanation: 'Dentist visits help keep your teeth healthy. Visit every 6 months!',
    category: 'dentist-visits',
    difficulty: 'easy'
  },
  {
    id: 'chocolate-eating-patterns',
    question: 'Which is the better way to enjoy chocolate?',
    choices: [
      {
        id: 'chocolate-many-times',
        label: 'Eating chocolate many times',
        image: require('../../assets/images/quick-pick-chocolate-all-day.png')
      },
      {
        id: 'chocolate-with-meal',
        label: 'Eating chocolate with a meal',
        image: require('../../assets/images/quick-pick-chocolate-with-meal.png')
      }
    ],
    correctChoiceId: 'chocolate-with-meal',
    incorrectExplanation: 'Chocolate with a meal is kinder to your teeth than eating it all day!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'sugary-treat-timing',
    question: 'When is the better time to enjoy a sugary treat?',
    choices: [
      {
        id: 'sugar-before-bed',
        label: 'Before bed',
        image: require('../../assets/images/quick-pick-sugar-before-bed.png')
      },
      {
        id: 'sugar-with-meal',
        label: 'With a meal',
        image: require('../../assets/images/quick-pick-sugar-with-meal.png')
      }
    ],
    correctChoiceId: 'sugar-with-meal',
    incorrectExplanation: 'Enjoy sugary treats with a meal, not before bed. It is kinder to your teeth!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'dates-or-chocolate-cereal',
    question: 'Which is the healthier food choice?',
    choices: [
      {
        id: 'chocolate-cereal',
        label: 'Chocolate cereal',
        image: require('../../assets/images/quick-pick-chocolate-cereal.png')
      },
      {
        id: 'dates',
        label: 'Dates',
        image: require('../../assets/images/quick-pick-dates.png')
      }
    ],
    correctChoiceId: 'dates',
    incorrectExplanation: 'Dates are fruit and a better choice than sugary chocolate cereal!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'dates-or-gummy-candy',
    question: 'Which is the healthier snack?',
    choices: [
      {
        id: 'gummy-candy',
        label: 'Gummy candy',
        image: require('../../assets/images/quick-pick-gummy-candy.png')
      },
      {
        id: 'dates-instead-of-gummies',
        label: 'Dates',
        image: require('../../assets/images/quick-pick-dates-vs-gummies.png')
      }
    ],
    correctChoiceId: 'dates-instead-of-gummies',
    incorrectExplanation: 'Dates are fruit. Gummy candy has added sugar and can stick to your teeth!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'nuts-or-crackers',
    question: 'Which can be the healthier snack?',
    choices: [
      {
        id: 'cheese-crackers',
        label: 'Crackers',
        image: require('../../assets/images/quick-pick-cheese-crackers.png')
      },
      {
        id: 'mixed-nuts',
        label: 'Nuts',
        image: require('../../assets/images/quick-pick-mixed-nuts.png')
      }
    ],
    correctChoiceId: 'mixed-nuts',
    incorrectExplanation: 'Nuts can be a healthier choice than crackers. Ask a grown-up if nuts are safe for you!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'popcorn-or-chocolate-cereal',
    question: 'Which can be the healthier snack?',
    choices: [
      {
        id: 'chocolate-cereal-snack',
        label: 'Chocolate cereal',
        image: require('../../assets/images/quick-pick-chocolate-cereal-snack.png')
      },
      {
        id: 'plain-popcorn',
        label: 'Plain popcorn',
        image: require('../../assets/images/quick-pick-plain-popcorn.png')
      }
    ],
    correctChoiceId: 'plain-popcorn',
    incorrectExplanation: 'Plain popcorn usually has less added sugar. Ask a grown-up if popcorn is safe for you!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'popcorn-or-crackers',
    question: 'Which can be the healthier snack?',
    choices: [
      {
        id: 'crackers-vs-popcorn',
        label: 'Cheesy crackers',
        image: require('../../assets/images/quick-pick-crackers-vs-popcorn.png')
      },
      {
        id: 'popcorn-vs-crackers',
        label: 'Plain popcorn',
        image: require('../../assets/images/quick-pick-popcorn-vs-crackers.png')
      }
    ],
    correctChoiceId: 'popcorn-vs-crackers',
    incorrectExplanation: 'Plain popcorn can have fewer added ingredients than cheesy crackers. Ask a grown-up if popcorn is safe for you!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'best-drink-for-teeth',
    question: 'Which drink is best for your teeth?',
    choices: [
      {
        id: 'orange-juice',
        label: 'Orange juice',
        image: require('../../assets/images/quick-pick-orange-juice.png')
      },
      {
        id: 'water',
        label: 'Water',
        image: require('../../assets/images/quick-pick-water.png')
      },
      {
        id: 'soda',
        label: 'Soda',
        image: require('../../assets/images/quick-pick-soda.png')
      }
    ],
    correctChoiceId: 'water',
    incorrectExplanation: 'Water has no sugar and helps wash your mouth. It is a great drink for your teeth!',
    category: 'healthy-drinks',
    difficulty: 'easy'
  },
  {
    id: 'whole-fruit-or-juice',
    question: 'Which is the healthier fruit choice?',
    choices: [
      {
        id: 'fruit-juice',
        label: 'Fruit juice',
        image: require('../../assets/images/quick-pick-fruit-juice.png')
      },
      {
        id: 'whole-fruit',
        label: 'Whole fruit',
        image: require('../../assets/images/quick-pick-whole-fruit.png')
      }
    ],
    correctChoiceId: 'whole-fruit',
    incorrectExplanation: 'Whole fruit has helpful fiber and is better for your teeth than sipping juice!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'healthy-or-sugary-food-group',
    question: 'Which group is the healthier choice?',
    choices: [
      {
        id: 'sugary-food-group',
        label: 'Sugary treats',
        image: require('../../assets/images/quick-pick-sugary-food-group.png')
      },
      {
        id: 'healthy-food-group',
        label: 'Everyday foods and water',
        image: require('../../assets/images/quick-pick-healthy-food-group.png')
      }
    ],
    correctChoiceId: 'healthy-food-group',
    incorrectExplanation: 'Everyday foods and water help your body and smile. Sugary treats are for sometimes!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'healthy-or-sugary-snacks',
    question: 'Which group makes a healthier snack?',
    choices: [
      {
        id: 'sugary-snacks',
        label: 'Sugary snacks',
        image: require('../../assets/images/quick-pick-sugary-snacks.png')
      },
      {
        id: 'healthy-snacks',
        label: 'Everyday snacks',
        image: require('../../assets/images/quick-pick-healthy-snacks.png')
      }
    ],
    correctChoiceId: 'healthy-snacks',
    incorrectExplanation: 'Fruit, vegetables, cheese, and plain yogurt are everyday choices. Sugary snacks are for sometimes!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'healthy-or-sugary-breakfast',
    question: 'Which picture shows a healthier breakfast?',
    choices: [
      {
        id: 'sugary-breakfast',
        label: 'Sugary breakfast',
        image: require('../../assets/images/quick-pick-sugary-breakfast.png')
      },
      {
        id: 'healthy-breakfast',
        label: 'Healthy breakfast',
        image: require('../../assets/images/quick-pick-healthy-breakfast.png')
      }
    ],
    correctChoiceId: 'healthy-breakfast',
    incorrectExplanation: 'Fruit, eggs, dairy, whole grains, and water help you start the day strong!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'healthy-lunchbox-comparison',
    question: 'Which lunchbox is the healthier choice?',
    choices: [
      {
        id: 'sugary-lunchbox',
        label: 'Lunchbox with sugary snacks',
        image: require('../../assets/images/quick-pick-sugary-lunchbox.png')
      },
      {
        id: 'healthy-lunchbox',
        label: 'Lunchbox with water and vegetables',
        image: require('../../assets/images/quick-pick-healthy-lunchbox.png')
      }
    ],
    correctChoiceId: 'healthy-lunchbox',
    incorrectExplanation: 'A lunchbox with water, vegetables, and fewer sugary snacks helps your body and smile!',
    category: 'healthy-eating',
    difficulty: 'easy'
  },
  {
    id: 'juice-with-or-without-straw',
    question: 'If you drink juice, which way can help keep it away from your teeth?',
    choices: [
      {
        id: 'juice-without-straw',
        label: 'Drinking without a straw',
        image: require('../../assets/images/quick-pick-juice-without-straw.png')
      },
      {
        id: 'juice-with-straw',
        label: 'Drinking with a straw',
        image: require('../../assets/images/quick-pick-juice-with-straw.png')
      }
    ],
    correctChoiceId: 'juice-with-straw',
    incorrectExplanation: 'A straw can help juice touch your teeth less. Water is still the best everyday drink!',
    category: 'healthy-drinks',
    difficulty: 'easy'
  },
  {
    id: 'brushing-duration',
    question: 'How long should you brush your teeth?',
    choices: [
      {
        id: 'brush-one-minute',
        label: '1 minute',
        image: require('../../assets/images/quick-pick-brushing-one-minute.png')
      },
      {
        id: 'brush-two-minutes',
        label: '2 minutes',
        image: require('../../assets/images/quick-pick-brushing-two-minutes.png')
      },
      {
        id: 'brush-five-minutes',
        label: '5 minutes',
        image: require('../../assets/images/quick-pick-brushing-five-minutes.png')
      }
    ],
    correctChoiceId: 'brush-two-minutes',
    incorrectExplanation: 'Brush for 2 minutes, twice a day, to give every tooth a good clean!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'brushing-frequency',
    question: 'How many times should you brush each day?',
    choices: [
      {
        id: 'brush-four-times',
        label: '4 times',
        image: require('../../assets/images/quick-pick-brushing-four-times.png')
      },
      {
        id: 'brush-twice',
        label: '2 times',
        image: require('../../assets/images/quick-pick-brushing-twice.png')
      },
      {
        id: 'brush-once',
        label: '1 time',
        image: require('../../assets/images/quick-pick-brushing-once.png')
      }
    ],
    correctChoiceId: 'brush-twice',
    incorrectExplanation: 'Brush 2 times every day—once in the morning and once before bed!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'brushing-pressure',
    question: 'Which picture shows the right brushing pressure?',
    choices: [
      {
        id: 'brushing-too-hard',
        label: 'Brushing too hard',
        image: require('../../assets/images/quick-pick-brushing-too-hard.png')
      },
      {
        id: 'brushing-gently',
        label: 'Brushing gently',
        image: require('../../assets/images/quick-pick-brushing-gently.png')
      }
    ],
    correctChoiceId: 'brushing-gently',
    incorrectExplanation: 'Use gentle little circles. They clean your teeth while protecting your gums!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'brushing-schedule',
    question: 'Which picture shows the best brushing schedule?',
    choices: [
      {
        id: 'brushing-morning-only',
        label: 'Morning only',
        image: require('../../assets/images/quick-pick-brushing-morning-only.png')
      },
      {
        id: 'brushing-morning-night',
        label: 'Morning and night',
        image: require('../../assets/images/quick-pick-brushing-morning-night.jpg')
      },
      {
        id: 'brushing-night-only',
        label: 'Night only',
        image: require('../../assets/images/quick-pick-brushing-night-only.png')
      }
    ],
    correctChoiceId: 'brushing-morning-night',
    incorrectExplanation: 'Brush once in the morning and once before bed to keep your smile clean all day!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'brushing-all-surfaces',
    question: 'Which picture shows a complete brushing?',
    choices: [
      {
        id: 'brushing-one-surface',
        label: 'Brushing one surface',
        image: require('../../assets/images/quick-pick-brushing-one-surface.png')
      },
      {
        id: 'brushing-every-surface',
        label: 'Brushing every surface',
        image: require('../../assets/images/quick-pick-brushing-all-surfaces.png')
      }
    ],
    correctChoiceId: 'brushing-every-surface',
    incorrectExplanation: 'Brush the front, back, and tops of every tooth, then gently brush your tongue!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'floss-or-toothpick',
    question: 'Which tool is made to clean between your teeth?',
    choices: [
      {
        id: 'toothpick',
        label: 'Toothpick',
        image: require('../../assets/images/quick-pick-toothpick.png')
      },
      {
        id: 'dental-floss',
        label: 'Dental floss',
        image: require('../../assets/images/quick-pick-dental-floss.png')
      }
    ],
    correctChoiceId: 'dental-floss',
    incorrectExplanation: 'Floss gently cleans the sides between teeth. Ask a grown-up to help you!',
    category: 'flossing',
    difficulty: 'easy'
  },
  {
    id: 'flossing-schedule',
    question: 'How often should you floss?',
    choices: [
      {
        id: 'flossing-too-often',
        label: 'Many times a day',
        image: require('../../assets/images/quick-pick-flossing-too-often.png')
      },
      {
        id: 'flossing-daily',
        label: 'Once each day',
        image: require('../../assets/images/quick-pick-flossing-daily.png')
      },
      {
        id: 'no-flossing',
        label: 'Never flossing',
        image: require('../../assets/images/quick-pick-no-flossing.png')
      }
    ],
    correctChoiceId: 'flossing-daily',
    incorrectExplanation: 'Floss gently once each day to clean between your teeth. Ask a grown-up to help!',
    category: 'flossing',
    difficulty: 'easy'
  },
  {
    id: 'healthy-smile-or-cavities',
    question: 'Which picture shows a healthy smile?',
    choices: [
      {
        id: 'smile-with-cavities',
        label: 'Smile with cavities',
        image: require('../../assets/images/quick-pick-smile-with-cavities.png')
      },
      {
        id: 'healthy-smile',
        label: 'Healthy smile',
        image: require('../../assets/images/quick-pick-healthy-smile.png')
      }
    ],
    correctChoiceId: 'healthy-smile',
    incorrectExplanation: 'Brushing, flossing, and dentist visits help stop cavities and keep your smile healthy!',
    category: 'healthy-smile',
    difficulty: 'easy'
  },
  {
    id: 'healthy-smile-or-plaque',
    question: 'Which smile has less plaque?',
    choices: [
      {
        id: 'smile-with-plaque',
        label: 'Smile with plaque',
        image: require('../../assets/images/quick-pick-smile-with-plaque.png')
      },
      {
        id: 'plaque-free-smile',
        label: 'Clean smile',
        image: require('../../assets/images/quick-pick-plaque-free-smile.png')
      }
    ],
    correctChoiceId: 'plaque-free-smile',
    incorrectExplanation: 'Plaque is a sticky layer on teeth. Brushing and flossing help clean it away!',
    category: 'healthy-smile',
    difficulty: 'easy'
  },
  {
    id: 'toothbrush-condition',
    question: 'Which toothbrush is ready to use?',
    choices: [
      {
        id: 'worn-toothbrush',
        label: 'Worn toothbrush',
        image: require('../../assets/images/quick-pick-worn-toothbrush.png')
      },
      {
        id: 'new-toothbrush',
        label: 'New toothbrush',
        image: require('../../assets/images/quick-pick-new-toothbrush.png')
      }
    ],
    correctChoiceId: 'new-toothbrush',
    incorrectExplanation: 'Change your toothbrush when the bristles look worn or spread out so it can clean well!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'toothbrush-replacement-time',
    question: 'When should you usually replace your toothbrush?',
    choices: [
      {
        id: 'replace-one-month',
        label: 'Every 1 month',
        image: require('../../assets/images/quick-pick-replace-one-month.png')
      },
      {
        id: 'replace-three-months',
        label: 'Every 3 months',
        image: require('../../assets/images/quick-pick-replace-three-months.png')
      },
      {
        id: 'replace-six-months',
        label: 'Every 6 months',
        image: require('../../assets/images/quick-pick-replace-six-months.png')
      }
    ],
    correctChoiceId: 'replace-three-months',
    incorrectExplanation: 'Get a new toothbrush about every 3 months, or sooner if the bristles look worn!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'correct-toothpaste-amount',
    question: 'How much toothpaste should you use?',
    choices: [
      {
        id: 'no-toothpaste',
        label: 'No toothpaste',
        image: require('../../assets/images/quick-pick-no-toothpaste.png')
      },
      {
        id: 'pea-sized-toothpaste',
        label: 'A pea-sized amount',
        image: require('../../assets/images/quick-pick-pea-toothpaste.png')
      },
      {
        id: 'too-much-toothpaste',
        label: 'A long strip',
        image: require('../../assets/images/quick-pick-too-much-toothpaste.png')
      }
    ],
    correctChoiceId: 'pea-sized-toothpaste',
    incorrectExplanation: 'Use a pea-sized amount of fluoride toothpaste. Ask a grown-up to help you!',
    category: 'brushing-habits',
    difficulty: 'easy'
  },
  {
    id: 'spit-or-rinse-after-brushing',
    question: 'What should you do after brushing?',
    choices: [
      {
        id: 'rinse-after-brushing',
        label: 'Rinse with water',
        image: require('../../assets/images/quick-pick-rinse-after-brushing.png')
      },
      {
        id: 'spit-after-brushing',
        label: 'Spit without rinsing',
        image: require('../../assets/images/quick-pick-spit-after-brushing.png')
      }
    ],
    correctChoiceId: 'spit-after-brushing',
    incorrectExplanation:
      'Spit out the toothpaste, but do not rinse. This helps fluoride keep protecting your teeth!',
    category: 'brushing-habits',
    difficulty: 'easy'
  }
];
