import { LanguageCode } from '../types/app';

type LocalizedQuestion = Record<LanguageCode, string>;

const foodQuestion: LocalizedQuestion = {
  en: 'Which food is better for your teeth?',
  fr: 'Quel aliment est meilleur pour tes dents ?',
  ar: 'أي طعام أفضل لأسنانك؟'
};

export const pickTheRightOneQuestionText: Record<string, LocalizedQuestion> = {
  'regular-dentist-visits': {
    en: 'When should you go to the dentist?',
    fr: 'Quand dois-tu aller chez le dentiste ?',
    ar: 'متى يجب أن تذهب إلى طبيب الأسنان؟'
  },
  'chocolate-eating-patterns': {
    en: 'How often should you eat sweets?',
    fr: 'Combien de fois dois-tu manger des sucreries ?',
    ar: 'كم مرة يجب أن تأكل الحلويات؟'
  },
  'sugary-treat-timing': {
    en: 'When should you eat sweets?',
    fr: 'Quand dois-tu manger des sucreries ?',
    ar: 'متى يجب أن تأكل الحلويات؟'
  },
  'dates-or-chocolate-cereal': foodQuestion,
  'dates-or-gummy-candy': foodQuestion,
  'nuts-or-crackers': foodQuestion,
  'popcorn-or-chocolate-cereal': foodQuestion,
  'popcorn-or-crackers': foodQuestion,
  'best-drink-for-teeth': foodQuestion,
  'whole-fruit-or-juice': foodQuestion,
  'healthy-or-sugary-food-group': foodQuestion,
  'healthy-or-sugary-snacks': foodQuestion,
  'healthy-or-sugary-breakfast': foodQuestion,
  'healthy-lunchbox-comparison': {
    en: 'Which lunchbox is better for your teeth?',
    fr: 'Quelle boîte-repas est meilleure pour tes dents ?',
    ar: 'أي علبة طعام أفضل لأسنانك؟'
  },
  'juice-with-or-without-straw': {
    en: 'How should you drink juice?',
    fr: 'Comment dois-tu boire le jus ?',
    ar: 'كيف يجب أن تشرب العصير؟'
  },
  'brushing-duration': {
    en: 'How many minutes should you brush your teeth?',
    fr: 'Pendant combien de minutes dois-tu te brosser les dents ?',
    ar: 'كم دقيقة يجب أن تنظف أسنانك؟'
  },
  'brushing-frequency': {
    en: 'How many times a day should you brush your teeth?',
    fr: 'Combien de fois par jour dois-tu te brosser les dents ?',
    ar: 'كم مرة في اليوم يجب أن تنظف أسنانك؟'
  },
  'brushing-pressure': {
    en: 'How should you brush your teeth?',
    fr: 'Comment dois-tu te brosser les dents ?',
    ar: 'كيف يجب أن تنظف أسنانك؟'
  },
  'brushing-schedule': {
    en: 'When should you brush your teeth?',
    fr: 'Quand dois-tu te brosser les dents ?',
    ar: 'متى يجب أن تنظف أسنانك؟'
  },
  'brushing-all-surfaces': {
    en: 'Which picture shows the best way to brush your teeth?',
    fr: 'Quelle image montre la meilleure façon de te brosser les dents ?',
    ar: 'أي صورة تظهر أفضل طريقة لتنظيف أسنانك؟'
  },
  'floss-or-toothpick': {
    en: 'What should you use to clean between your teeth?',
    fr: 'Qu’est-ce que tu dois utiliser pour nettoyer entre tes dents ?',
    ar: 'ماذا يجب أن تستخدم لتنظيف ما بين أسنانك؟'
  },
  'flossing-schedule': {
    en: 'How many times a day should you clean between your teeth?',
    fr: 'Combien de fois par jour dois-tu nettoyer entre tes dents ?',
    ar: 'كم مرة في اليوم يجب أن تنظف ما بين أسنانك؟'
  },
  'healthy-smile-or-cavities': {
    en: 'Which smile has clean teeth?',
    fr: 'Quel sourire a les dents propres ?',
    ar: 'أي ابتسامة أسنانها نظيفة؟'
  },
  'healthy-smile-or-plaque': {
    en: 'Which smile has healthy teeth?',
    fr: 'Quel sourire a les dents en bonne santé ?',
    ar: 'أي ابتسامة أسنانها صحية؟'
  },
  'toothbrush-condition': {
    en: 'Which toothbrush should you use?',
    fr: 'Quelle brosse à dents dois-tu utiliser ?',
    ar: 'أي فرشاة أسنان يجب أن تستخدم؟'
  },
  'toothbrush-replacement-time': {
    en: 'When should you change your toothbrush?',
    fr: 'Quand dois-tu changer ta brosse à dents ?',
    ar: 'متى يجب أن تغيّر فرشاة أسنانك؟'
  },
  'correct-toothpaste-amount': {
    en: 'How much toothpaste should you put on your toothbrush?',
    fr: 'Quelle quantité de dentifrice dois-tu mettre sur ta brosse à dents ?',
    ar: 'ما كمية معجون الأسنان التي يجب أن تضعها على فرشاة أسنانك؟'
  },
  'spit-or-rinse-after-brushing': {
    en: 'What should you do after brushing your teeth?',
    fr: 'Que dois-tu faire après t’être brossé les dents ?',
    ar: 'ماذا يجب أن تفعل بعد تنظيف أسنانك؟'
  }
};

export const getPickTheRightOneQuestionText = (questionId: string, language: LanguageCode, fallback: string) =>
  pickTheRightOneQuestionText[questionId]?.[language] ?? fallback;
