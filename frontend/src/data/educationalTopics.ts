import { ImageSourcePropType } from 'react-native';
import { LanguageCode } from '../types/app';

export type EducationalVideo = {
  remoteUrl?: string;
};

export type LocalizedText = Record<LanguageCode, string>;

export type EducationalCue = {
  startMs: number;
  endMs: number;
  subtitles: LocalizedText;
  imageSource: ImageSourcePropType;
};

export type EducationalTopic = {
  id: string;
  title: LocalizedText;
  video: EducationalVideo;
  videoAccessibilityLabel?: LocalizedText;
  cues: EducationalCue[];
};

const helloImage = require('../../assets/educational/healthy-food/hello.png');
const strongTeethImage = require('../../assets/educational/healthy-food/strong-teeth.png');
const chooseHealthyFoodsImage = require('../../assets/educational/healthy-food/choose-healthy-foods.png');
const drinkWaterImage = require('../../assets/educational/healthy-food/drink-water.png');
const limitSugaryFoodsImage = require('../../assets/educational/healthy-food/limit-sugary-foods.png');
const goodEatingHabitsImage = require('../../assets/educational/healthy-food/good-eating-habits.png');
const teethCareHelloImage = require('../../assets/educational/teeth-care/hello.png');
const dailyCareImage = require('../../assets/educational/teeth-care/daily-care.png');
const brushTwoMinutesImage = require('../../assets/educational/teeth-care/brush-two-minutes.png');
const peaSizedToothpasteImage = require('../../assets/educational/teeth-care/pea-sized-toothpaste.png');
const cleanAllSurfacesImage = require('../../assets/educational/teeth-care/clean-all-surfaces.png');
const brushTongueImage = require('../../assets/educational/teeth-care/brush-tongue.png');
const spitToothpasteImage = require('../../assets/educational/teeth-care/spit-toothpaste.png');
const doNotRinseImage = require('../../assets/educational/teeth-care/do-not-rinse.png');
const flossImage = require('../../assets/educational/teeth-care/floss.png');
const changeToothbrushImage = require('../../assets/educational/teeth-care/change-toothbrush.png');
const brightSmileImage = require('../../assets/educational/teeth-care/bright-smile.png');
const dentalVisitHelloImage = require('../../assets/educational/dental-visit/hello.png');
const healthyTeethImage = require('../../assets/educational/dental-visit/healthy-teeth.png');
const everySixMonthsImage = require('../../assets/educational/dental-visit/every-six-months.png');
const earlyProblemsImage = require('../../assets/educational/dental-visit/early-problems.png');
const healthySmileImage = require('../../assets/educational/dental-visit/healthy-smile.png');

export const educationalTopics: EducationalTopic[] = [
  {
    id: 'healthy-food',
    title: {
      en: 'Healthy Food',
      fr: 'Alimentation saine',
      ar: 'الغذاء الصحي'
    },
    video: {
      remoteUrl: process.env.EXPO_PUBLIC_HEALTHY_FOOD_VIDEO_URL?.trim()
    },
    videoAccessibilityLabel: {
      en: 'Healthy food sign language video',
      fr: 'Vidéo en langue des signes sur une alimentation saine',
      ar: 'فيديو بلغة الإشارة عن الغذاء الصحي'
    },
    cues: [
      {
        startMs: 0,
        endMs: 4000,
        subtitles: {
          en: 'Hello, little friends!',
          fr: 'Bonjour, les amis!',
          ar: 'مرحبًا يا أصدقائي الصغار!'
        },
        imageSource: helloImage
      },
      {
        startMs: 5000,
        endMs: 14000,
        subtitles: {
          en: 'Did you know that healthy food helps keep your teeth strong?',
          fr: 'Saviez-vous qu’une alimentation saine aide à garder vos dents fortes?',
          ar: 'هل تعلمون أن الطعام الصحي يساعد على إبقاء أسنانكم قوية؟'
        },
        imageSource: strongTeethImage
      },
      {
        startMs: 15000,
        endMs: 28000,
        subtitles: {
          en: 'Choose healthy foods like fruits, vegetables, milk, and cheese',
          fr: 'Choisissez des aliments sains comme les fruits, les légumes, le lait et le fromage',
          ar: 'اختاروا أطعمة صحية مثل الفواكه والخضار والحليب والجبن'
        },
        imageSource: chooseHealthyFoodsImage
      },
      {
        startMs: 29000,
        endMs: 31000,
        subtitles: {
          en: 'Drink water',
          fr: 'Buvez de l’eau',
          ar: 'اشربوا الماء'
        },
        imageSource: drinkWaterImage
      },
      {
        startMs: 32000,
        endMs: 36000,
        subtitles: {
          en: 'Try to limit sugary foods',
          fr: 'Essayez de limiter les aliments sucrés',
          ar: 'حاولوا التقليل من الحلويات'
        },
        imageSource: limitSugaryFoodsImage
      },
      {
        startMs: 37000,
        endMs: 45000,
        subtitles: {
          en: 'If you eat something sweet, it is better to have it with a meal',
          fr: 'Si vous mangez quelque chose de sucré, il est préférable de le manger pendant un repas',
          ar: 'إذا تناولتم شيئًا حلوًا، فمن الأفضل تناوله مع وجبة'
        },
        imageSource: limitSugaryFoodsImage
      },
      {
        startMs: 46000,
        endMs: 57000,
        subtitles: {
          en: 'Your healthy choices help keep your teeth strong and your smile beautiful!',
          fr: 'De bons choix alimentaires vous aident à garder vos dents fortes et à avoir un joli sourire !',
          ar: 'اختياراتكم الصحية تساعدكم على الحفاظ على أسنان قوية وابتسامة جميلة !'
        },
        imageSource: goodEatingHabitsImage
      }
    ]
  },
  {
    id: 'taking-care-of-your-teeth',
    title: {
      en: 'Taking Care of Your Teeth',
      fr: 'Prendre soin de ses dents',
      ar: 'العناية بأسنانك'
    },
    video: {
      remoteUrl: process.env.EXPO_PUBLIC_TEETH_CARE_VIDEO_URL?.trim()
    },
    videoAccessibilityLabel: {
      en: 'Taking care of your teeth sign language video',
      fr: 'Vidéo en langue des signes sur les soins dentaires quotidiens',
      ar: 'فيديو بلغة الإشارة عن العناية اليومية بالأسنان'
    },
    cues: [
      {
        startMs: 0,
        endMs: 4000,
        subtitles: {
          en: 'Hello, little friends!',
          fr: 'Bonjour, les amis !',
          ar: 'مرحبًا يا أصدقائي الصغار!'
        },
        imageSource: teethCareHelloImage
      },
      {
        startMs: 5000,
        endMs: 14000,
        subtitles: {
          en: 'Did you know that your teeth need care every day?',
          fr: 'Saviez-vous que vos dents ont besoin de soins tous les jours?',
          ar: 'هل تعلمون أن أسنانكم تحتاج إلى العناية كل يوم؟'
        },
        imageSource: dailyCareImage
      },
      {
        startMs: 15000,
        endMs: 26000,
        subtitles: {
          en: 'Brush your teeth for two minutes every morning and every night using a pea-sized amount of toothpaste',
          fr: 'Brossez vos dents pendant deux minutes chaque matin et chaque soir avec une quantité de dentifrice de la taille d’un petit pois',
          ar: 'نظّفوا أسنانكم لمدة دقيقتين كل صباح وكل مساء باستخدام كمية من معجون الأسنان بحجم حبة البازلاء'
        },
        imageSource: brushTwoMinutesImage
      },
      {
        startMs: 26000,
        endMs: 30000,
        subtitles: {
          en: 'Brush your teeth for two minutes every morning and every night using a pea-sized amount of toothpaste',
          fr: 'Brossez vos dents pendant deux minutes chaque matin et chaque soir avec une quantité de dentifrice de la taille d’un petit pois',
          ar: 'نظّفوا أسنانكم لمدة دقيقتين كل صباح وكل مساء باستخدام كمية من معجون الأسنان بحجم حبة البازلاء'
        },
        imageSource: peaSizedToothpasteImage
      },
      {
        startMs: 30000,
        endMs: 36000,
        subtitles: {
          en: 'Clean all the surfaces of your teeth: the outside, inside, and chewing surfaces',
          fr: 'Nettoyez toutes les surfaces de vos dents : l’extérieur, l’intérieur et les surfaces de mastication',
          ar: 'نظّفوا جميع أسطح الأسنان: السطح الخارجي، والسطح الداخلي، وأسطح المضغ'
        },
        imageSource: cleanAllSurfacesImage
      },
      {
        startMs: 37000,
        endMs: 41000,
        subtitles: {
          en: 'Brush your tongue too!',
          fr: 'Brossez aussi votre langue!',
          ar: 'نظّفوا اللسان أيضًا!'
        },
        imageSource: brushTongueImage
      },
      {
        startMs: 42000,
        endMs: 47000,
        subtitles: {
          en: 'After brushing, spit out the toothpaste. Do not rinse with water',
          fr: 'Après le brossage, crachez le dentifrice. Ne rincez pas avec de l’eau',
          ar: 'بعد تنظيف الأسنان، ابصقوا معجون الأسنان. لا تتمضمضوا بالماء'
        },
        imageSource: spitToothpasteImage
      },
      {
        startMs: 47000,
        endMs: 51000,
        subtitles: {
          en: 'After brushing, spit out the toothpaste. Do not rinse with water',
          fr: 'Après le brossage, crachez le dentifrice. Ne rincez pas avec de l’eau',
          ar: 'بعد تنظيف الأسنان، ابصقوا معجون الأسنان. لا تتمضمضوا بالماء'
        },
        imageSource: doNotRinseImage
      },
      {
        startMs: 52000,
        endMs: 60000,
        subtitles: {
          en: 'Use floss every day to clean between your teeth',
          fr: 'Utilisez le fil dentaire tous les jours pour nettoyer entre vos dents',
          ar: 'استخدموا خيط الأسنان يوميًا لتنظيف ما بين الأسنان'
        },
        imageSource: flossImage
      },
      {
        startMs: 61000,
        endMs: 66000,
        subtitles: {
          en: 'Change your toothbrush every three months',
          fr: 'Changez votre brosse à dents tous les trois mois',
          ar: 'استبدلوا فرشاة الأسنان كل ثلاثة أشهر'
        },
        imageSource: changeToothbrushImage
      },
      {
        startMs: 67000,
        endMs: 74000,
        subtitles: {
          en: 'Take care of your teeth and keep your smile bright!',
          fr: 'Prenez soin de vos dents et gardez un beau sourire!',
          ar: 'اهتموا بأسنانكم وحافظوا على ابتسامتكم الجميلة!'
        },
        imageSource: brightSmileImage
      }
    ]
  },
  {
    id: 'dental-visit',
    title: {
      en: 'Dental Visit',
      fr: 'Visite chez le dentiste',
      ar: 'زيارة طبيب الأسنان'
    },
    video: {
      remoteUrl: process.env.EXPO_PUBLIC_DENTAL_VISIT_VIDEO_URL?.trim()
    },
    videoAccessibilityLabel: {
      en: 'Dental visit sign language video',
      fr: 'Vidéo en langue des signes sur les visites chez le dentiste',
      ar: 'فيديو بلغة الإشارة عن زيارة طبيب الأسنان'
    },
    cues: [
      {
        startMs: 0,
        endMs: 4000,
        subtitles: {
          en: 'Hello, little friends!',
          fr: 'Bonjour, les amis !',
          ar: 'مرحبًا يا أصدقائي الصغار!'
        },
        imageSource: dentalVisitHelloImage
      },
      {
        startMs: 4000,
        endMs: 15000,
        subtitles: {
          en: 'Did you know that visiting the dentist helps keep your teeth healthy?',
          fr: 'Saviez-vous que les visites chez le dentiste aident à garder vos dents en bonne santé ?',
          ar: 'هل تعلمون أن زيارة طبيب الأسنان تساعد على الحفاظ على صحة أسنانكم؟'
        },
        imageSource: healthyTeethImage
      },
      {
        startMs: 16000,
        endMs: 28000,
        subtitles: {
          en: 'Visit your dentist every six months, even when your teeth do not hurt.',
          fr: 'Visitez votre dentiste tous les six mois, même si vos dents ne vous font pas mal',
          ar: 'زوروا طبيب أسنانكم كل ستة أشهر، حتى لو لم تشعروا بأي ألم'
        },
        imageSource: everySixMonthsImage
      },
      {
        startMs: 28000,
        endMs: 45000,
        subtitles: {
          en: 'Your dentist checks your teeth, helps keep them strong, and can find problems early',
          fr: 'Le dentiste vérifie vos dents, vous aide à les garder fortes et peut détecter les problèmes dès le début',
          ar: 'يقوم طبيب الأسنان بفحص أسنانكم، ويساعد على إبقائها قوية، ويمكنه اكتشاف أي مشكلة في وقت مبكر'
        },
        imageSource: earlyProblemsImage
      },
      {
        startMs: 45000,
        endMs: 58000,
        subtitles: {
          en: 'Regular dental visits help keep your smile healthy and beautiful!',
          fr: 'Les visites régulières chez le dentiste aident à garder des dents en bonne santé et un beau sourire !',
          ar: 'زيارة طبيب الأسنان بانتظام تساعدكم على الحفاظ على أسنان صحية وابتسامة جميلة!'
        },
        imageSource: healthySmileImage
      }
    ]
  }
];
