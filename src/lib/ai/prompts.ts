import { PlanRequest } from '@/types/ai-planner';

const COUNTRY_CONTEXT: Record<string, { visa: string; costs: string; places: string }> = {
  turkey: {
    visa: 'Azərbaycan vətəndaşları üçün vizasız (90 gün)',
    costs: 'Uçuş: 150-300 AZN, Otel: 40-100 AZN/gecə, Gündəlik: 60-120 AZN',
    places: 'İstanbul, Antalya, Kapadokya, Bodrum, Trabzon',
  },
  dubai: {
    visa: 'Gəlişdə viza — 30 gün. Pasport 6 ay müddətində etibarlı olmalıdır',
    costs: 'Uçuş: 350-600 AZN, Otel: 80-300 AZN/gecə, Gündəlik: 100-250 AZN',
    places: 'Burj Khalifa, Dubai Mall, Palm Jumeirah, JBR Beach, Marina',
  },
  georgia: {
    visa: 'Azərbaycan vətəndaşları üçün vizasız (1 il)',
    costs: 'Uçuş: 80-200 AZN, Otel: 30-80 AZN/gecə, Gündəlik: 40-80 AZN',
    places: 'Tiflis, Batumi, Kazbegi, Svaneti, Mestia',
  },
  japan: {
    visa: 'Viza lazımdır. Emal müddəti 5-7 iş günü',
    costs: 'Uçuş: 1000-1500 AZN, Otel: 80-200 AZN/gecə, Gündəlik: 100-200 AZN',
    places: 'Tokyo, Kyoto, Osaka, Fuji dağı, Hiroshima',
  },
  thailand: {
    visa: '30 gün vizasız. 60 günə qədər uzadılma mümkündür',
    costs: 'Uçuş: 700-1200 AZN, Otel: 20-80 AZN/gecə, Gündəlik: 30-80 AZN',
    places: 'Bangkok, Phuket, Chiang Mai, Krabi, Pattaya',
  },
  italy: {
    visa: 'Schengen viza lazımdır. Emal müddəti 10-15 iş günü',
    costs: 'Uçuş: 400-700 AZN, Otel: 60-200 AZN/gecə, Gündəlik: 80-180 AZN',
    places: 'Roma, Venesiya, Florensiya, Milan, Neapol',
  },
  france: {
    visa: 'Schengen viza lazımdır. Emal müddəti 10-15 iş günü',
    costs: 'Uçuş: 450-750 AZN, Otel: 70-250 AZN/gecə, Gündəlik: 90-200 AZN',
    places: 'Paris, Nice, Lyon, Marseille, Bordeaux',
  },
  russia: {
    visa: 'Viza lazımdır. Emal müddəti 5-10 iş günü',
    costs: 'Uçuş: 200-400 AZN, Otel: 40-120 AZN/gecə, Gündəlik: 50-120 AZN',
    places: 'Moskva, Sankt-Peterburq, Kazan, Sochi',
  },
  iran: {
    visa: 'Viza lazımdır. Sərhəddə viza mümkün deyil',
    costs: 'Uçuş: 150-300 AZN, Otel: 20-60 AZN/gecə, Gündəlik: 25-60 AZN',
    places: 'Tehran, İsfahan, Şiraz, Persepolis, Tabriz',
  },
  uk: {
    visa: 'Böyük Britaniya viza lazımdır. Emal müddəti 15 iş günü',
    costs: 'Uçuş: 500-900 AZN, Otel: 80-250 AZN/gecə, Gündəlik: 100-220 AZN',
    places: 'London, Manchester, Oxford, Edinburgh, Cambridge',
  },
};

function getCountryContext(destination: string): string {
  const key = destination.toLowerCase().replace(/\s+/g, '');
  const entry = COUNTRY_CONTEXT[key];
  if (entry) {
    return `Platformanın məlumatları bu ölkə üçün:
- Viza: ${entry.visa}
- Ortalama xərclər: ${entry.costs}
- Populyar yerlər: ${entry.places}`;
  }
  return '';
}

function getLanguageInstruction(lang: string): string {
  switch (lang) {
    case 'az':
      return 'Azərbaycan dilində cavab ver. Azərbaycan manatı (AZN) istifadə et. Bakıdan (GYD) uçuşları nəzərdə tut.';
    case 'ru':
      return 'Отвечай на русском языке. Используй манаты (AZN). Учитывай вылеты из Баку (GYD).';
    case 'en':
      return 'Answer in English. Use Azerbaijani Manat (AZN). Consider flights from Baku (GYD).';
    default:
      return 'Answer in English. Use AZN currency. Consider flights from Baku (GYD).';
  }
}

export function buildPrompt(request: PlanRequest): string {
  const countryContext = getCountryContext(request.destination);
  const langInstruction = getLanguageInstruction(request.language);

  const daysCount = Math.ceil(
    (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const styleLabel =
    request.travelStyle === 'budget' ? 'büdcə / budget'
    : request.travelStyle === 'luxury' ? 'lüks / luxury'
    : 'orta / mid-range';

  return `Sən TravelAZ platformasının AI səyahət planlaşdırıcısısın.
${langInstruction}

İstifadəçi məlumatları:
- Destinasiya: ${request.destination}
- Tarix: ${request.startDate} - ${request.endDate} (${daysCount} gün)
- Səyahətçilər: ${request.travelers} nəfər
- Büdcə (nəfər başı): ${request.budget} AZN
- Səyahət tərzi: ${styleLabel}
- Maraqlar: ${request.interests.join(', ')}

${countryContext}

Hər gün üçün detallı plan hazırla. Hər gündə 3-5 aktivlik, yemək tövsiyələri (səhər, nahar, şam), nəqliyyat məlumatı və təxmini xərc göstər.
Vacib məsləhətlər və çanta siyahısı da əlavə et.

Cavabını YALNIZ aşağıdakı JSON formatında ver, heç bir digər mətn əlavə etmə:
{
  "summary": "Qısa səyahət xülasəsi (2-3 cümlə)",
  "totalEstimatedCost": {
    "amount": 0,
    "currency": "AZN",
    "breakdown": {
      "flights": 0,
      "accommodation": 0,
      "food": 0,
      "activities": 0,
      "transport": 0
    }
  },
  "days": [
    {
      "day": 1,
      "title": "Gün başlığı",
      "activities": [
        {
          "time": "09:00",
          "activity": "Aktivlik təsviri",
          "location": "Məkan",
          "cost": 0,
          "tip": "Qısa məsləhət"
        }
      ],
      "meals": {
        "breakfast": "Səhər yeməyi tövsiyəsi",
        "lunch": "Nahar tövsiyəsi",
        "dinner": "Şam yeməyi tövsiyəsi"
      },
      "transport": "Nəqliyyat məlumatı",
      "estimatedCost": 0
    }
  ],
  "tips": ["Məsləhət 1", "Məsləhət 2"],
  "visaInfo": {
    "required": true,
    "type": "Viza növü",
    "processingTime": "Emal müddəti"
  },
  "bestTimeToVisit": "Ən yaxşı ziyarət vaxtı",
  "packingList": ["Əşya 1", "Əşya 2"]
}`;
}
