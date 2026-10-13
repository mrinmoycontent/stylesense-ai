import { Season, Occasion } from '../types';

export interface ProStylingTip {
  season: Season;
  occasion: Occasion;
  headline: string;
  goldenRule: string;
  mindset: string;
  layeringStrategy: string;
  fabrics: {
    recommended: string[];
    avoid: string[];
  };
  colorPalette: {
    primary: string;
    accents: string[];
    description: string;
  };
  footwearGuidance: string;
  finishingTouches: string[];
  quickChecklist: string[];
}

export const SEASONS_INFO: Record<Season, {
  name: string;
  tagline: string;
  climateMood: string;
  accentColor: string;
}> = {
  spring: {
    name: 'Spring',
    tagline: 'Transitional freshness & fluid layers',
    climateMood: 'Fluctuating breezes with warming sunbeams',
    accentColor: '#6B8E23'
  },
  summer: {
    name: 'Summer',
    tagline: 'High-breathability ease & solar refinement',
    climateMood: 'Warm to hot temperatures requiring air circulation',
    accentColor: '#D97706'
  },
  autumn: {
    name: 'Autumn',
    tagline: 'Rich tactile depths & sartorial tailoring',
    climateMood: 'Crisp air, gold light, and multi-piece outerwear',
    accentColor: '#C19A6B'
  },
  winter: {
    name: 'Winter',
    tagline: 'Architectural warmth & nocturnal elegance',
    climateMood: 'Sub-zero gusts, cold drizzle, and cozy interiors',
    accentColor: '#4A5568'
  }
};

export const PRO_STYLING_TIPS_CATALOG: Record<string, ProStylingTip> = {
  // SPRING (5 Occasions)
  'spring_casual': {
    season: 'spring',
    occasion: 'casual',
    headline: 'The Trans-Seasonal Ease Formula',
    goldenRule: 'Pair one fluid transitional layer with clean, unripped denim or tailored cotton trousers.',
    mindset: 'Spring weather is notoriously mercurial. Your casual look should peel back effortlessly if temperatures climb by mid-afternoon.',
    layeringStrategy: 'Unlined trench coat or chore jacket draped over a Breton striped long-sleeve tee or fine cotton knit.',
    fabrics: {
      recommended: ['Egyptian cotton poplin', 'Washed canvas', 'Fine-gauge merino wool', 'Light twill'],
      avoid: ['Heavy chunky fleeces', 'Synthetic non-breathable polyester', 'Winter corduroys']
    },
    colorPalette: {
      primary: 'Ivory Cream & Sage Green',
      accents: ['Sky Blue', 'Honey Mustard', 'Raw Indigo'],
      description: 'Airy botanical neutrals balanced by crisp daylight blues and grounding denim.'
    },
    footwearGuidance: 'Butter-soft leather loafers, low-profile court sneakers, or minimalist Chelsea boots in cognac.',
    finishingTouches: [
      'Light silk-cotton neck bandana loosely tied',
      'Structured woven canvas tote with leather trim',
      'Tortoiseshell sunglasses with amber-tinted lenses'
    ],
    quickChecklist: [
      'Outer layer is lightweight and easily unbuttoned or draped',
      'No winter bulk around the neckline',
      'Ankles slightly visible for breezy proportion'
    ]
  },

  'spring_office': {
    season: 'spring',
    occasion: 'office',
    headline: 'Crisp Architecture & Tropical Weaves',
    goldenRule: 'Swap dense winter wools for breathable tropical wool or high-twist cotton suits in illuminated neutrals.',
    mindset: 'Command boardroom presence without overheating. Structure must come from precise tailoring rather than heavy fabric weight.',
    layeringStrategy: 'Unlined single-breasted blazer over a silk-blend shell or crisp poplin shirt, paired with tailored cigarette or wide-leg trousers.',
    fabrics: {
      recommended: ['Tropical wool (Super 120s)', 'Cotton-silk blends', 'Matte crepe de Chine', 'Lightweight gabardine'],
      avoid: ['Heavy flannel', 'Thick brushed tweed', 'Clingy synthetic rayon']
    },
    colorPalette: {
      primary: 'French Navy & Soft Ecru',
      accents: ['Dusty Sage', 'Champagne Beige', 'Pale Slate'],
      description: 'Authoritative cool neutrals softened with delicate botanical tones.'
    },
    footwearGuidance: 'Calfskin almond-toe slingbacks or horsebit loafers with neat leather soles.',
    finishingTouches: [
      'Clean architectural leather satchel in taupe or caramel',
      'Brushed silver or understated gold cuff watch',
      'Streamlined silk pocket square or discreet lapel pin'
    ],
    quickChecklist: [
      'Trousers break cleanly at the shoe collar without pooling',
      'Blazer vents lie flat across the hips',
      'Collar stands crisply without wilting under humidity'
    ]
  },

  'spring_party': {
    season: 'spring',
    occasion: 'party',
    headline: 'Luminous Drape & High-Low Contrasts',
    goldenRule: 'Offset a fluid silk or satin garment with an intentionally sharp, menswear-inspired tailored blazer.',
    mindset: 'Spring evenings can carry a sharp chill; embrace sensual drape beneath a protective, elegant shell.',
    layeringStrategy: 'Bias-cut midi slip dress or wide-leg silk trousers paired with an oversized boyfriend blazer draped loosely over shoulders.',
    fabrics: {
      recommended: ['Heavy silk charmeuse', 'Fluid viscose crepe', 'Metallic lurex knit', 'Sleek calfskin'],
      avoid: ['Thick holiday velvets', 'Heavy wool knits', 'Stiff starched canvas']
    },
    colorPalette: {
      primary: 'Dusty Rosewater & Obsidian Black',
      accents: ['Champagne Gold', 'Muted Lilac', 'Polished Silver'],
      description: 'Luminous romantic undertones sharpened by high-contrast black framing.'
    },
    footwearGuidance: 'Pointed metallic slingbacks, strappy block-heel sandals, or sculptural mules.',
    finishingTouches: [
      'Architectural geometric drop earrings in mixed metals',
      'Compact kiss-lock evening pouch in polished leather',
      'Single statement cuff on a bare forearm'
    ],
    quickChecklist: [
      'Slip fabric skims contours without clinging or pulling',
      'Shoulder-draped jacket stays secure when walking',
      'Jewelry catches candlelight without competing with the neckline'
    ]
  },

  'spring_date_night': {
    season: 'spring',
    occasion: 'date_night',
    headline: 'Subtle Tactility & Exposed Collarbones',
    goldenRule: 'Focus on one alluring focal cut—an open collar, draped cowl, or ankle-skimming hemline—and keep the rest effortless.',
    mindset: 'The goal is quiet magnetism: pieces that invite touch through luxurious textures rather than overt formality.',
    layeringStrategy: 'Open-collar silk blouse tucked into high-waisted fluid trousers, finished with a cropped bouclé or buttery leather jacket.',
    fabrics: {
      recommended: ['Washed silk', 'Fine ribbed knit', 'Buttery lambskin', 'Fluid cupro'],
      avoid: ['Stiff starched fabrics', 'Bulky thermal layers', 'Scratchy coarse weaves']
    },
    colorPalette: {
      primary: 'Merlot Burgundy & Champagne Ivory',
      accents: ['Warm Cognac', 'Soft Apricot', 'Espresso'],
      description: 'Sensual warmth that glows under intimate dining and candlelight.'
    },
    footwearGuidance: 'Pointed kitten-heel boots or supple slingback pumps in rich burgundy or black.',
    finishingTouches: [
      'Delicate layered gold pendant necklace',
      'Compact baguette bag tucked securely under the arm',
      'Warm woody-amber fragrance signature'
    ],
    quickChecklist: [
      'Comfortable seating silhouette (no restrictive waistbands)',
      'Fabric breathes easily in heated indoor settings',
      'Accessories emit zero metallic clatter during dinner'
    ]
  },

  'spring_wedding_guest': {
    season: 'spring',
    occasion: 'wedding_guest',
    headline: 'Pastoral Refinement & Lawn-Ready Poise',
    goldenRule: 'Choose romantic movement and garden-appropriate heel surfaces; never challenge the bridal white palette.',
    mindset: 'Celebrate the couple with graceful optimism while maintaining flawless comfort from afternoon ceremony to late-night dance.',
    layeringStrategy: 'Tiered midi dress in printed chiffon or fluid pastel tailored jumpsuit, paired with a matching lightweight shawl or collarless cropped jacket.',
    fabrics: {
      recommended: ['Silk georgette', 'Crepe de Chine', 'Embroidered organza', 'Lightweight modal blend'],
      avoid: ['White, ivory, or bridal cream tones', 'Stiletto heels that sink into garden soil', 'Heavy winter brocade']
    },
    colorPalette: {
      primary: 'Dusty Sage & Wisteria Lavender',
      accents: ['Soft Peach', 'Warm Butter', 'Brushed Rose Gold'],
      description: 'Poetic spring garden hues that photograph exquisitely in daylight.'
    },
    footwearGuidance: 'Block-heel suede sandals or platform wedges that glide gracefully across lawns without sinking.',
    finishingTouches: [
      'Structured minaudière clutch with floral or mother-of-pearl inlay',
      'Fresh botanical or pearl drop earrings',
      'Coordinating lightweight pashmina for breezy sunset vows'
    ],
    quickChecklist: [
      'Hemline clears outdoor dew and cobblestones safely',
      'Fabric doesn’t crease after prolonged seated ceremonies',
      'Sunscreen-friendly fabric that won’t stain under warmth'
    ]
  },

  // SUMMER (5 Occasions)
  'summer_casual': {
    season: 'summer',
    occasion: 'casual',
    headline: 'High-Twist Breathability & Effortless Sun-Bleach',
    goldenRule: 'Rely on architectural loose silhouettes in 100% natural fibers rather than skintight cuts.',
    mindset: 'When heat is intense, space between the fabric and skin creates natural cooling circulation and effortless nonchalance.',
    layeringStrategy: 'Unbuttoned linen overshirt worn over a lightweight ribbed tank top with relaxed wide-leg drawstring trousers.',
    fabrics: {
      recommended: ['100% Belgian linen', 'Seersucker cotton', 'High-twist cotton voile', 'Tencel lyocell'],
      avoid: ['Synthetic polyester or nylon blends', 'Heavy selvedge denim', 'Rubberized or PVC footwear']
    },
    colorPalette: {
      primary: 'Bleached Ecru & Sun-Washed Sand',
      accents: ['Terracotta', 'Cerulean Blue', 'Olive Drab'],
      description: 'Earthy, sun-drenched neutrals designed to deflect direct solar heat.'
    },
    footwearGuidance: 'Woven leather huaraches, molded ergonomic slide sandals, or unlined espadrilles.',
    finishingTouches: [
      'Woven raffia bucket or market tote bag',
      'UV-blocking polarized acetate sunglasses',
      'Linen bucket hat or wide-brim straw fedora'
    ],
    quickChecklist: [
      'Loose weave permits light airflow',
      'Colors reflect rather than absorb solar rays',
      'Natural creasing in linen is embraced as part of the relaxed texture'
    ]
  },

  'summer_office': {
    season: 'summer',
    occasion: 'office',
    headline: 'Thermal Transition & Smart Airflow Tailoring',
    goldenRule: 'Master the contrast between sweltering outdoor commutes and freezing air-conditioned conference rooms.',
    mindset: 'Professional decorum must be maintained without visibly sweating. Select blended weaves that resist perspiration wrinkles.',
    layeringStrategy: 'Deconstructed linen-wool or cotton-silk blazer over a sleeveless jewel-neck silk shell, paired with fluid pleated culottes or chinos.',
    fabrics: {
      recommended: ['Linen-wool-silk blends', 'Open-weave fresco wool', 'Mercerized cotton', 'Matte jersey'],
      avoid: ['Pure thin linen (wrinkles too aggressively for executive meetings)', 'Lined synthetic blazers', 'Sweat-staining pastels']
    },
    colorPalette: {
      primary: 'Oatmeal Taupe & Crisp White',
      accents: ['Sky Blue Poplin', 'Navy Blue', 'Cognac Tan'],
      description: 'Sharp maritime-inspired tailoring that looks crisp even at 32°C.'
    },
    footwearGuidance: 'Perforated leather loafers, pointed slingback kitten heels with open heel counter, or sleek mules.',
    finishingTouches: [
      'A compact fine-cashmere or silk wrap folded inside your tote for chilly AC',
      'Structured box calf leather tote that retains shape in humidity',
      'Minimalist brushed silver watch'
    ],
    quickChecklist: [
      'Underarm breathability verified before leaving home',
      'Blazer lining is quarter-lined or half-lined for airflow',
      'Fabric stays opaque under strong summer sunlight'
    ]
  },

  'summer_party': {
    season: 'summer',
    occasion: 'party',
    headline: 'Open-Back Drama & Golden Hour Gloss',
    goldenRule: 'Prioritize backless, halter, or sculptural asymmetrical cuts that capture warm balmy twilight air.',
    mindset: 'Golden hour drinks and rooftop soirées demand silhouettes that move with the breeze and glow under setting sun rays.',
    layeringStrategy: 'Backless linen-silk column dress or high-waisted silk palazzo pants with a structured metallic bandeau and sheer over-drape.',
    fabrics: {
      recommended: ['Lustrous silk twill', 'Lurex-infused cotton', 'Fine pleated plissé', 'Breezy organza'],
      avoid: ['Heavy brocade', 'Stifling synthetics', 'Non-breathable leather pants']
    },
    colorPalette: {
      primary: 'Sunset Ochre & Bright Ivory',
      accents: ['Shimmering Copper', 'Coral Rose', 'Burnished Gold'],
      description: 'Radiant sunset tones illuminated by golden-hour reflections.'
    },
    footwearGuidance: 'Barely-there strappy metallic stiletto or block sandals with ankle ties.',
    finishingTouches: [
      'Sculptural hammered gold collar necklace',
      'Beaded or woven mother-of-pearl mini clutch',
      'Glow-boosting body shimmer applied along collarbones and shoulders'
    ],
    quickChecklist: [
      'Straps securely fastened for dancing',
      'Breathable undergarments designed for high humidity',
      'Zero heavy outerwear needed beyond a light silk duster'
    ]
  },

  'summer_date_night': {
    season: 'summer',
    occasion: 'date_night',
    headline: 'Fluid Romance & Warm-Breeze Sensuality',
    goldenRule: 'Contrast an effortless, breezy silhouette with sultry gold accessories and a whisper of skin.',
    mindset: 'Al fresco dining under strings of lights calls for intoxicating ease—unfussy hair, luminous skin, and floating silhouettes.',
    layeringStrategy: 'Slip dress with delicate cowl neckline, or an off-the-shoulder linen blouse paired with a high-slit slip skirt.',
    fabrics: {
      recommended: ['Washed silk crepe', 'Crinkled modal', 'Featherlight linen gauze', 'Soft jersey'],
      avoid: ['Restrictive heavy tailoring', 'Stiff denims', 'Bulky jackets']
    },
    colorPalette: {
      primary: 'Terracotta Rust & Warm Butter Cream',
      accents: ['Olive Green', 'Warm Honey', 'Brushed Bronze'],
      description: 'Intimate Mediterranean warmth that evokes Tuscan evenings.'
    },
    footwearGuidance: 'Sleek leather lace-up sandals or pointed-toe leather mules with low sculpted heel.',
    finishingTouches: [
      'Fine gold body chain or delicate anklet',
      'Compact leather pouch in warm cognac',
      'Jasmine or neroli botanical fragrance'
    ],
    quickChecklist: [
      'Dress or skirt moves gracefully when walking outdoors',
      'Fabric doesn’t cling uncomfortably if outdoor dining is humid',
      'Jewelry feels light and cool against warm skin'
    ]
  },

  'summer_wedding_guest': {
    season: 'summer',
    occasion: 'wedding_guest',
    headline: 'Airy Ceremony Poise & Sunlit Grandeur',
    goldenRule: 'Prioritize sun-deflecting light palettes, breathable weaves, and dignified necklines that withstand outdoor heat.',
    mindset: 'Outdoor afternoon ceremonies in direct sunlight require proactive styling: UV protection, sweat-proof fabrics, and wind-resistant hemlines.',
    layeringStrategy: 'Flowing maxi gown in silk chiffon, or a sharp pastel linen-silk three-piece suit with a lightweight waistcoat.',
    fabrics: {
      recommended: ['Silk chiffon', 'Linen-viscose blends', 'Cotton organdy', 'Georgette'],
      avoid: ['Heavy satin duchess', 'Deep blacks or navy that bake under the sun', 'Ultra-mini hemlines prone to updrafts']
    },
    colorPalette: {
      primary: 'Soft Buttercup & Sage Eucalyptus',
      accents: ['Powder Blue', 'Champagne Peach', 'Brushed Champagne Gold'],
      description: 'Celebratory botanical pastels that reflect heat and photograph naturally.'
    },
    footwearGuidance: 'Espadrille wedges or wide block-heel sandals that handle uneven garden grass and gravel driveways.',
    finishingTouches: [
      'Chic paper-braid or straw parasol/fan for the outdoor ceremony',
      'Compact tortoiseshell clutch',
      'Pearl drop earrings that catch outdoor daylight'
    ],
    quickChecklist: [
      'Gown hemline cleared above dusty gravel paths',
      'Undergarments invisible under semi-sheer fabrics in bright daylight',
      'Sunglasses kept subtle and classic for outdoor photography'
    ]
  },

  // AUTUMN (5 Occasions)
  'autumn_casual': {
    season: 'autumn',
    occasion: 'casual',
    headline: 'Textural Depth & Heritage Outerwear',
    goldenRule: 'Stack three distinct textural surfaces—ribbed knitwear, raw denim, and suede or wool outerwear.',
    mindset: 'Autumn is the quintessential styling season. The crisp air invites rich tactile depth, layering mastery, and heritage materials.',
    layeringStrategy: 'Merino wool turtleneck or waffle henley under an unbuttoned flannel or suede overshirt, topped with a camel wool trench or chore coat.',
    fabrics: {
      recommended: ['Heavy gauge cashmere', 'Suede & nubuck', 'Wale corduroy', 'Japanese raw denim'],
      avoid: ['Summer paper-thin linens', 'Stark white cottons', 'Neon synthetic activewear']
    },
    colorPalette: {
      primary: 'Camel Tan & Espresso Brown',
      accents: ['Merlot Burgundy', 'Burnt Ochre', 'Forest Green'],
      description: 'Foliage-inspired earthy luxury rooted in warm wood tones and amber highlights.'
    },
    footwearGuidance: 'Lug-sole Chelsea boots, burnished leather lace-up derby boots, or rich suede loafers.',
    finishingTouches: [
      'Cashmere ribbed scarf in oatmeal or charcoal',
      'Structured leather messenger or saddle bag in pull-up leather',
      'Brass-buckled bridle leather belt'
    ],
    quickChecklist: [
      'Layers nest smoothly without bunching up in the armpits',
      'Suede footwear treated with water-resistant spray',
      'Trousers have substantial weight to drape without clinging'
    ]
  },

  'autumn_office': {
    season: 'autumn',
    occasion: 'office',
    headline: 'Sartorial Power & Houndstooth Precision',
    goldenRule: 'Anchor the silhouette with a substantial double-breasted overcoat and structured pleated wool trousers.',
    mindset: 'Bring cinematic boardroom presence. Deep autumn tones and structured shoulders exude quiet authority and timeless refinement.',
    layeringStrategy: 'Fine-gauge merino turtleneck under a double-breasted wool blazer, topped with a tailored camel or charcoal overcoat.',
    fabrics: {
      recommended: ['Worsted wool flannel', 'Glen plaid & houndstooth', 'Heavy silk twill', 'Structured gabardine'],
      avoid: ['Unlined flimsy synthetics', 'Summer seersucker', 'Chunky ski knits inside the office']
    },
    colorPalette: {
      primary: 'Midnight Navy & Camel Tan',
      accents: ['Espresso Brown', 'Cognac Leather', 'Brushed Gold'],
      description: 'The golden standard of transatlantic sartorial executive elegance.'
    },
    footwearGuidance: 'Polished calfskin monk straps, pointed leather Chelsea boots, or classic Oxford shoes.',
    finishingTouches: [
      'Structured briefcase or portfolio tote in burnished oxblood leather',
      'Classic round-face timepiece with alligator-grain strap',
      'Silk twill scarf tucked discreetly beneath the lapel'
    ],
    quickChecklist: [
      'Overcoat length extends past the blazer hem by at least 10 cm',
      'Pleats on trousers fall straight down the leg crease',
      'Knitwear collar remains neat without sagging'
    ]
  },

  'autumn_party': {
    season: 'autumn',
    occasion: 'party',
    headline: 'Lustrous Velvet & Nocturnal Opulence',
    goldenRule: 'Incorporate one high-sheen tactile piece—crushed velvet, satin lapels, or patent leather—against matte tailoring.',
    mindset: 'Autumn soirées embrace shadowy sophistication, warm candlelight, and decadent, rich textures.',
    layeringStrategy: 'Velvet dinner jacket over a silk camisole or fine knit, paired with high-waisted satin-striped tuxedo trousers.',
    fabrics: {
      recommended: ['Cotton velvet', 'Heavy hammered satin', 'Patent calfskin', 'Lustrous brocade'],
      avoid: ['Summer eyelet lace', 'Sporty cotton fleece', 'Casual canvas']
    },
    colorPalette: {
      primary: 'Merlot Burgundy & Obsidian Black',
      accents: ['Deep Emerald', 'Burnished Bronze', 'Antique Gold'],
      description: 'Nocturnal jewel tones with brooding, aristocratic warmth.'
    },
    footwearGuidance: 'Pointed patent leather pumps, velvet evening slippers, or sleek kitten-heel sock booties.',
    finishingTouches: [
      'Antique gold cocktail ring with smoky quartz or garnet stone',
      'Rigid architectural metal box clutch',
      'Deep berry lip and manicured nail finish'
    ],
    quickChecklist: [
      'Velvet pile brushed in uniform direction before departure',
      'Tuxedo trousers hemmed precisely for evening heel height',
      'Outer layer check-in friendly for coat room transitions'
    ]
  },

  'autumn_date_night': {
    season: 'autumn',
    occasion: 'date_night',
    headline: 'Cozy Tactility & Cinematic Warmth',
    goldenRule: 'Pair an ultra-soft tactile knit (cashmere or alpaca) with a sleek leather or satin bottom.',
    mindset: 'A cozy fireside wine bar or candlelit corner table calls for sensory contrast: irresistibly soft knitwear meeting sleek leather.',
    layeringStrategy: 'Slouchy mock-neck cashmere sweater partially tucked into an A-line leather midi skirt or dark wash straight jeans.',
    fabrics: {
      recommended: ['Plush cashmere', 'Supple vegan or lambskin leather', 'Brushed alpaca', 'Silk-wool blends'],
      avoid: ['Drafty loose crochet', 'Stiff boxy denim jackets that cannot bend at the table', 'Scratchy lambswool']
    },
    colorPalette: {
      primary: 'Warm Espresso & Spiced Cinnamon',
      accents: ['Ivory Cream', 'Merlot', 'Warm Amber'],
      description: 'Intimate dessert-and-wine tones that feel warm and inviting.'
    },
    footwearGuidance: 'Block-heel suede ankle booties or sleek knee-high leather boots under the midi hem.',
    finishingTouches: [
      'Warm amber or vanilla bean signature scent',
      'Soft croissant-shaped leather shoulder bag',
      'Chunky twisted gold hoop earrings'
    ],
    quickChecklist: [
      'Sweater does not shed fuzz onto dark companion fabrics',
      'Boots comfortable for walking between restaurant and after-dinner drinks',
      'Warm enough for outdoor strolls without bundling like a polar trekker'
    ]
  },

  'autumn_wedding_guest': {
    season: 'autumn',
    occasion: 'wedding_guest',
    headline: 'Baroque Jewel Tones & Tailored Wraps',
    goldenRule: 'Select rich jewel tones and prepare an integrated outerwear piece so outdoor photo sessions remain stylish.',
    mindset: 'Autumn weddings frequently span crisp outdoor ceremonies and warm indoor receptions. Your outerwear must look as intentional as your gown.',
    layeringStrategy: 'Long-sleeve jacquard or silk satin midi dress complemented by a tailored wool capelet or belted wrap coat.',
    fabrics: {
      recommended: ['Silk jacquard', 'Devoré velvet', 'Heavy silk crepe', 'Fine wool blend'],
      avoid: ['Summer pastels and floral prints that look out of season', 'Flimsy unlined dresses that shudder in wind', 'White or cream bases']
    },
    colorPalette: {
      primary: 'Emerald Forest & Rich Merlot',
      accents: ['Warm Ochre', 'Navy Blue', 'Antique Gold'],
      description: 'Regal tapestry palette suited for historic estates and vineyard venues.'
    },
    footwearGuidance: 'Closed-toe pointed velvet heels, patent slingbacks, or refined ankle-strap dress shoes.',
    finishingTouches: [
      'Plush faux-fur stole or coordinating wool wrap',
      'Embellished satin minaudière clutch',
      'Jewel-toned drop earrings featuring emerald or tourmaline tones'
    ],
    quickChecklist: [
      'Outer wrap coordinated with dress color palette',
      'Sleeve or hem length resists gusty ceremony winds',
      'Footwear sole tested on slick indoor dance floor parquet'
    ]
  },

  // WINTER (5 Occasions)
  'winter_casual': {
    season: 'winter',
    occasion: 'casual',
    headline: 'Thermal Architecture & Sculptural Shearling',
    goldenRule: 'Make your coat the primary outfit anchor, letting intentional collar, cuff, and boot proportions frame the look.',
    mindset: 'In deep winter, pedestrians see your coat 90% of the time. Invest in architectural outerwear that looks striking even fully zipped.',
    layeringStrategy: 'Silk thermal base layer + heavyweight fisherman cable knit + long double-faced wool coat or shearling aviator jacket.',
    fabrics: {
      recommended: ['Double-faced wool', 'Shearling / sheepskin', 'Thick gauge cashmere', 'Heavyweight moleskin'],
      avoid: ['Single-layer thin knits', 'Cotton canvas without thermal lining', 'Canvas sneakers with zero insulation']
    },
    colorPalette: {
      primary: 'Charcoal Wool & Frost Ivory',
      accents: ['Cognac Leather', 'Deep Navy', 'Merlot'],
      description: 'Crisp alpine contrasts combining monolithic neutrals with warm leather accents.'
    },
    footwearGuidance: 'Waterproof lug-sole Chelsea boots, lined shearling hiking boots, or robust Vibram-sole derbies.',
    finishingTouches: [
      'Thick ribbed cashmere beanie in ecru or heather grey',
      'Cashmere blanket scarf wrapped in a clean Parisian knot',
      'Fleece-lined leather gloves with touchscreen compatibility'
    ],
    quickChecklist: [
      'Base layer wicks perspiration indoors without cooling the skin',
      'Socks have wool insulation without cutting shoe circulation',
      'Outer coat covers kidneys and thighs against wind tunnels'
    ]
  },

  'winter_office': {
    season: 'winter',
    occasion: 'office',
    headline: 'Thermal Tailoring & Cashmere Armor',
    goldenRule: 'Wear thermal base layers beneath immaculate tailoring so you maintain sharp silhouettes without bulk.',
    mindset: 'Maintain uncompromising executive polish despite snow and slush. Transition seamlessly from salted sidewalks to clean boardroom carpeting.',
    layeringStrategy: 'Silk-blend thermal camisole + fine merino turtleneck + tailored wool suit + full-length cashmere-wool tailored overcoat.',
    fabrics: {
      recommended: ['Heavyweight wool flannel', 'Cavalry twill', 'Pure cashmere', 'Structured double-weave wool'],
      avoid: ['Thin unlined summer trousers', 'Short jackets that leave suit tails exposed', 'Salt-damaged untreated leather']
    },
    colorPalette: {
      primary: 'Monochrome Slate Charcoal & Obsidian Black',
      accents: ['Winter White Cashmere', 'Camel Tan', 'Cool Silver'],
      description: 'Architectural, razor-sharp monochrome with high-contrast white knit accents.'
    },
    footwearGuidance: 'Weatherproof leather dress Chelsea boots for the commute, or keep polished horsebit loafers in the office wardrobe.',
    finishingTouches: [
      'Structured structured leather document tote with zip closure',
      'Tailored cashmere-lined leather driving gloves',
      'Clean wool fedora or wide-brim felt hat'
    ],
    quickChecklist: [
      'Overcoat completely conceals suit jacket length',
      'Trouser hems clear slush on city streets',
      'Leather shoes treated with protective wax against road salts'
    ]
  },

  'winter_party': {
    season: 'winter',
    occasion: 'party',
    headline: 'High-Drama Brocade & Shimmering Frost',
    goldenRule: 'Embrace dramatic black-tie opulence: deep velvets, shimmering sequins, and architectural evening overcoats.',
    mindset: 'Winter festivities allow for maximum theatricality. Dramatic textures and jewel-encrusted finishes sparkle brilliantly in low holiday lighting.',
    layeringStrategy: 'Structured velvet tuxedo or sequined column dress beneath a plush faux-fur evening coat or structured opera cape.',
    fabrics: {
      recommended: ['Heavy silk velvet', 'Metallic lurex / sequins', 'Embossed brocade', 'Plush faux fur'],
      avoid: ['Thin summer silks that induce goosebumps', 'Casual puffer jackets over evening wear', 'Open-toe sandals on icy sidewalks']
    },
    colorPalette: {
      primary: 'Midnight Black & Shimmering Silver',
      accents: ['Emerald Green', 'Royal Sapphire', 'Champagne Crystal'],
      description: 'Starlit winter night glamour with icy metallic radiance.'
    },
    footwearGuidance: 'Pointed crystal-embellished evening pumps, velvet platforms, or sleek metallic pointed booties.',
    finishingTouches: [
      'Dramatic chandelier earrings or rhinestone collar necklace',
      'Micro crystal mesh evening pouch',
      'Faux fur hand warmer or structured stole for entry photos'
    ],
    quickChecklist: [
      'Coat check plan prepared for outerwear at venue entrance',
      'Sheer black tights (15–20 denier) for leg insulation without losing glamour',
      'Anti-static spray applied to avoid party fabric cling'
    ]
  },

  'winter_date_night': {
    season: 'winter',
    occasion: 'date_night',
    headline: 'Nocturnal Allure & Warm Cashmere Cocoon',
    goldenRule: 'Pair a body-contouring turtleneck or knit dress with a dramatic belted wool coat and knee-high leather boots.',
    mindset: 'Evoke Scandinavian or Parisian winter romance: stepping into a warm bistro from a frosted evening street.',
    layeringStrategy: 'Ribbed knit column dress worn with a wide waist belt, tall leather boots, and a heavy belted wrap coat in camel or chocolate.',
    fabrics: {
      recommended: ['Fine ribbed wool knit', 'Supple calfskin boots', 'Double-faced camel wool', 'Silk lining'],
      avoid: ['Frumpy bulky puffers', 'Uncomfortable tight jeans that chill against winter winds', 'Chapped exposed skin']
    },
    colorPalette: {
      primary: 'Espresso Brown & Warm Vanilla Cream',
      accents: ['Merlot Burgundy', 'Brushed Rose Gold', 'Deep Plum'],
      description: 'Rich hot-chocolate and mulled-wine palette that glows by the fire.'
    },
    footwearGuidance: 'Sleek knee-high leather boots with block or stiletto heel worn tucked under or over hems.',
    finishingTouches: [
      'Sensual spiced vanilla or smoky cardamom perfume',
      'Small crescent leather crossbody in rich oxblood',
      'Warm statement gold earrings'
    ],
    quickChecklist: [
      'Coat silhouette cinched at waist to avoid swallowed proportions',
      'Boots have rubber-injected soles for icy restaurant steps',
      'Comfortable knitwear that breathes in warm dining rooms'
    ]
  },

  'winter_wedding_guest': {
    season: 'winter',
    occasion: 'wedding_guest',
    headline: 'Imperial Velvets & Tailored Grandeur',
    goldenRule: 'Choose floor-length or structured midi gowns in heavy formal fabrics paired with a designated formal coat.',
    mindset: 'Winter weddings are inherently grand and formal. Casual outerwear will instantly ruin formal photography—plan the total ensemble from street to ballroom.',
    layeringStrategy: 'Long-sleeve velvet or heavy crepe gown paired with a tailored tailored overcoat or capelet, accented with statement jewelry.',
    fabrics: {
      recommended: ['Heavy velvet', 'Silk Mikado', 'Wool crepe', 'Metallic brocade'],
      avoid: ['Light floral chiffon', 'Pastel summer shades', 'Bare arms without a warm wrap or sleeve']
    },
    colorPalette: {
      primary: 'Deep Merlot & Forest Emerald',
      accents: ['Midnight Navy', 'Warm Gold', 'Black Velvet'],
      description: 'Imperial jewel-box richness designed for historic cathedrals and grand banquet halls.'
    },
    footwearGuidance: 'Closed pointed-toe evening pumps or elegant satin block heels with embellished buckles.',
    finishingTouches: [
      'Plush velvet or faux-fur evening cape',
      'Structured satin evening clutch with jewel clasp',
      'Vintage-inspired paste or cubic zirconia drop earrings'
    ],
    quickChecklist: [
      'Sleeve or cape protects shoulders during chilly sanctuary vows',
      'Tights or stockings are tone-matched to formal footwear',
      'Evening wrap is securely fastened for the reception grand entrance'
    ]
  }
};

export const getProStylingTip = (season: Season, occasion: Occasion): ProStylingTip => {
  const key = `${season}_${occasion}`;
  if (PRO_STYLING_TIPS_CATALOG[key]) {
    return PRO_STYLING_TIPS_CATALOG[key];
  }
  // Fallback to spring_casual if unknown key
  return PRO_STYLING_TIPS_CATALOG['spring_casual'];
};
