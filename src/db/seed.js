import { db } from "@/db";
import {
  appMigrations,
  favorites,
  recipes,
  ingredients,
  recipeIngredients,
  products,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  EXTRA_INGREDIENTS,
  EXTRA_PRODUCTS,
  EXTRA_RECIPES,
} from "@/db/recipe-expansion";

const RECIPE_IMAGE_MAP = {
  "chicken-biryani": "/images/chicken-biryani.jpg",
  "paneer-butter-masala": "/images/paneer-butter-masala.jpg",
  "veg-pasta": "/images/veg-pasta.jpg",
  "dal-tadka": "/images/dal-tadka.jpg",
  "masala-dosa": "/images/masala-dosa.jpg",
  "chole-bhature": "/images/chole-bhature.jpg",
  "butter-chicken": "/images/butter-chicken.jpg",
  "hakka-noodles": "/images/veg-pasta.jpg",
  "margherita-pizza": "/images/veg-pasta.jpg",
  "gulab-jamun": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Two_Gulab_Jamun_in_a_plate_01.jpg/1280px-Two_Gulab_Jamun_in_a_plate_01.jpg",
  "rasmalai": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Rasmalai_3.jpg/1280px-Rasmalai_3.jpg",
  "chocolate-lava-cake": "/images/chocolate-lava-cake.jpg",
  "strawberry-cheesecake": "/images/strawberry-cheesecake.jpg",
  "ice-cream-sundae": "/images/ice-cream-sundae.jpg",
  "mango-kulfi": "/images/ice-cream-sundae.jpg",
  "chocolate-chip-cookies": "/images/chocolate-lava-cake.jpg",
  "veg-manchurian": "/images/veg-manchurian.jpg",
  "vegetable-spring-rolls": "/images/veg-spring-rolls.jpg",
  "crispy-corn": "https://upload.wikimedia.org/wikipedia/commons/b/be/Crispy_corn_made_by_me.jpg",
  "vegetable-pulao": "/images/veg-pulao.jpg",
  "palak-paneer": "/images/palak-paneer.jpg",
  "aloo-gobi": "/images/aloo-gobi.jpg",
  "paneer-tikka": "/images/paneer-tikka.jpg",
  "chicken-keema-masala": "/images/chicken-keema-masala.jpg",
};

const recipeImage = (slug) => RECIPE_IMAGE_MAP[slug] ?? "/images/chicken-biryani.jpg";

const INGREDIENTS = [
  {
    slug: "chicken",
    name: "Chicken",
    emoji: "🍗",
    about:
      "Lean protein that absorbs marinades beautifully. Curry cut pieces with bone add deep flavour to biryani and gravies.",
  },
  {
    slug: "rice",
    name: "Basmati Rice",
    emoji: "🍚",
    about:
      "Long-grain aromatic rice. Soak for 30 minutes before cooking for fluffy, separate grains.",
  },
  {
    slug: "onion",
    name: "Onion",
    emoji: "🧅",
    about:
      "The base of most Indian gravies. Thinly sliced and fried golden (birista) for biryani.",
  },
  {
    slug: "tomato",
    name: "Tomato",
    emoji: "🍅",
    about:
      "Adds tang, body and colour to gravies. Rich in lycopene and vitamin C. Choose firm, deep red tomatoes.",
  },
  {
    slug: "ginger",
    name: "Ginger",
    emoji: "🫚",
    about:
      "Warm, zesty root used fresh in pastes and marinades. Aids digestion.",
  },
  {
    slug: "garlic",
    name: "Garlic",
    emoji: "🧄",
    about:
      "Pungent and savoury. Crushed with ginger for the classic ginger-garlic paste.",
  },
  {
    slug: "mint",
    name: "Mint Leaves",
    emoji: "🌿",
    about:
      "Fresh, cooling herb layered between rice for signature biryani aroma.",
  },
  {
    slug: "yogurt",
    name: "Yogurt",
    emoji: "🥣",
    about: "Thick curd tenderises meat and adds a gentle tang to marinades.",
  },
  {
    slug: "spices",
    name: "Spices",
    emoji: "🌶️",
    about:
      "Whole and ground spices: cardamom, cloves, cinnamon, bay leaf, garam masala, turmeric and chilli.",
  },
  {
    slug: "paneer",
    name: "Paneer",
    emoji: "🧀",
    about:
      "Fresh Indian cottage cheese. Soak in warm water before cooking to keep it soft.",
  },
  {
    slug: "butter",
    name: "Butter",
    emoji: "🧈",
    about:
      "Adds richness to gravies. Use unsalted for better control of seasoning.",
  },
  {
    slug: "cream",
    name: "Fresh Cream",
    emoji: "🥛",
    about: "Silky finish for restaurant-style curries.",
  },
  {
    slug: "pasta",
    name: "Penne Pasta",
    emoji: "🍝",
    about: "Durum wheat pasta. Cook al dente in generously salted water.",
  },
  {
    slug: "bell-pepper",
    name: "Bell Pepper",
    emoji: "🫑",
    about: "Sweet and crunchy. Mix colours for a vibrant dish.",
  },
  {
    slug: "lentils",
    name: "Toor Dal",
    emoji: "🫘",
    about: "Split pigeon peas. Pressure cook until soft and creamy.",
  },
  {
    slug: "cumin",
    name: "Cumin Seeds",
    emoji: "🌱",
    about: "Earthy seeds that crackle in hot ghee for tadka.",
  },
  {
    slug: "potato",
    name: "Potato",
    emoji: "🥔",
    about: "Boiled and mashed for the classic dosa filling.",
  },
  {
    slug: "dosa-batter",
    name: "Dosa Batter",
    emoji: "🥞",
    about: "Fermented rice and urad dal batter. Ready-to-use for crisp dosas.",
  },
  {
    slug: "chickpeas",
    name: "Chickpeas",
    emoji: "🥫",
    about:
      "Soak overnight and pressure cook with tea bag for the classic dark chole.",
  },
  {
    slug: "flour",
    name: "Maida Flour",
    emoji: "🌾",
    about: "Refined wheat flour for soft, puffy bhature.",
  },
  {
    slug: "milk-powder",
    name: "Milk Powder",
    emoji: "🥛",
    about: "Full-cream milk powder gives gulab jamun its soft, rich centre.",
  },
  {
    slug: "sugar",
    name: "Sugar",
    emoji: "🍚",
    about: "Fine sugar for desserts, syrups and sweet sauces.",
  },
  {
    slug: "cardamom",
    name: "Cardamom",
    emoji: "🌱",
    about:
      "Fragrant green pods with a floral, citrusy aroma. Crush just before using.",
  },
  {
    slug: "ghee",
    name: "Ghee",
    emoji: "🧈",
    about: "Clarified butter with a high smoke point and a warm, nutty aroma.",
  },
  {
    slug: "rose-water",
    name: "Rose Water",
    emoji: "🌹",
    about: "A little rose water gives Indian sweets a delicate floral finish.",
  },
  {
    slug: "dark-chocolate",
    name: "Dark Chocolate",
    emoji: "🍫",
    about:
      "Rich baking chocolate for molten cakes, truffles and chewy cookies.",
  },
  {
    slug: "egg",
    name: "Eggs",
    emoji: "🥚",
    about: "Room-temperature eggs bind batters and create a tender crumb.",
  },
  {
    slug: "cocoa-powder",
    name: "Cocoa Powder",
    emoji: "🍫",
    about:
      "Unsweetened cocoa adds deep chocolate flavour to cakes and brownies.",
  },
  {
    slug: "strawberries",
    name: "Strawberries",
    emoji: "🍓",
    about:
      "Fresh, sweet-tart berries for compotes, toppings and summer desserts.",
  },
  {
    slug: "cream-cheese",
    name: "Cream Cheese",
    emoji: "🧀",
    about:
      "Smooth, tangy cream cheese is the base of a classic baked cheesecake.",
  },
  {
    slug: "biscuits",
    name: "Digestive Biscuits",
    emoji: "🍪",
    about: "Buttery biscuits crushed into a crisp cheesecake base.",
  },
  {
    slug: "ice-cream",
    name: "Vanilla Ice Cream",
    emoji: "🍨",
    about: "Creamy vanilla ice cream for sundaes, cakes and chilled desserts.",
  },
  {
    slug: "chocolate-sauce",
    name: "Chocolate Sauce",
    emoji: "🍫",
    about: "Silky chocolate sauce for drizzling over ice cream and fruit.",
  },
  {
    slug: "mixed-nuts",
    name: "Mixed Nuts",
    emoji: "🥜",
    about: "Roasted almonds, pistachios and cashews add crunch to sundaes.",
  },
  {
    slug: "mango",
    name: "Alphonso Mango",
    emoji: "🥭",
    about: "Sweet, ripe mango pulp makes a naturally fragrant summer kulfi.",
  },
  {
    slug: "condensed-milk",
    name: "Condensed Milk",
    emoji: "🥫",
    about:
      "Sweetened condensed milk creates a creamy, scoopable no-churn kulfi.",
  },
  {
    slug: "milk",
    name: "Whole Milk",
    emoji: "🥛",
    about: "Whole milk reduces into the rich, aromatic rabri for rasmalai.",
  },
  {
    slug: "saffron",
    name: "Saffron",
    emoji: "🌼",
    about: "A few saffron threads add a honeyed aroma and golden colour.",
  },
  {
    slug: "mozzarella",
    name: "Mozzarella",
    emoji: "🧀",
    about: "Mild, melty mozzarella for a classic stretch-cheese pizza.",
  },
  {
    slug: "pizza-base",
    name: "Pizza Base",
    emoji: "🍕",
    about: "Ready-to-top thin-crust pizza bases for an easy homemade pizza.",
  },
  {
    slug: "noodles",
    name: "Hakka Noodles",
    emoji: "🍜",
    about:
      "Springy wheat noodles for quick, high-heat Indo-Chinese stir-fries.",
  },
  {
    slug: "cabbage",
    name: "Cabbage",
    emoji: "🥬",
    about: "Finely shredded cabbage adds crunch to stir-fried noodles.",
  },
  {
    slug: "carrot",
    name: "Carrot",
    emoji: "🥕",
    about:
      "Sweet, crisp carrot cut into thin matchsticks for quick stir-fries.",
  },
  {
    slug: "soy-sauce",
    name: "Soy Sauce",
    emoji: "🫙",
    about:
      "Salty, savoury soy sauce seasons Indo-Chinese noodles and marinades.",
  },
  ...EXTRA_INGREDIENTS,
];

const PRODUCTS = {
  chicken: [
    {
      name: "Chicken (Curry Cut)",
      size: "500 g",
      price: 180,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Boneless Chicken", size: "500 g", price: 240 },
    { name: "Free Range Chicken", size: "500 g", price: 290 },
  ],
  rice: [
    {
      name: "Basmati Rice",
      size: "500 g",
      price: 70,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Aged Basmati Rice", size: "1 kg", price: 160 },
    { name: "Organic Brown Basmati", size: "1 kg", price: 190 },
  ],
  onion: [
    {
      name: "Red Onion",
      size: "500 g",
      price: 30,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Fried Onion (Birista)", size: "100 g", price: 60 },
  ],
  tomato: [
    {
      name: "Fresh Tomato",
      size: "500 g (approx. 4-5 pcs)",
      price: 40,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Organic Tomato", size: "500 g", price: 60 },
    { name: "Cherry Tomato", size: "250 g", price: 50 },
  ],
  ginger: [
    {
      name: "Ginger",
      size: "100 g",
      price: 25,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Ginger Garlic Paste", size: "200 g", price: 55 },
  ],
  garlic: [
    { name: "Garlic", size: "100 g", price: 30, isDefault: true },
    { name: "Peeled Garlic", size: "100 g", price: 45 },
  ],
  mint: [
    { name: "Mint Leaves", size: "1 bunch", price: 15, isDefault: true },
    { name: "Coriander & Mint Combo", size: "2 bunches", price: 25 },
  ],
  yogurt: [
    {
      name: "Yogurt",
      size: "200 g",
      price: 30,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Greek Yogurt", size: "200 g", price: 70 },
  ],
  spices: [
    { name: "Biryani Masala", size: "50 g", price: 60, isDefault: true },
    { name: "Whole Garam Masala Kit", size: "100 g", price: 120 },
    { name: "Garam Masala Powder", size: "100 g", price: 85 },
  ],
  paneer: [
    {
      name: "Fresh Paneer",
      size: "200 g",
      price: 90,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Malai Paneer", size: "200 g", price: 110 },
  ],
  butter: [
    { name: "Salted Butter", size: "100 g", price: 55, isDefault: true },
    { name: "Unsalted Butter", size: "100 g", price: 60 },
  ],
  cream: [{ name: "Fresh Cream", size: "200 ml", price: 65, isDefault: true }],
  pasta: [
    { name: "Penne Pasta", size: "500 g", price: 95, isDefault: true },
    { name: "Whole Wheat Penne", size: "500 g", price: 120 },
  ],
  "bell-pepper": [
    { name: "Green Capsicum", size: "250 g", price: 30, isDefault: true },
    { name: "Mixed Bell Peppers", size: "3 pcs", price: 90 },
  ],
  lentils: [
    { name: "Toor Dal", size: "500 g", price: 85, isDefault: true },
    { name: "Organic Toor Dal", size: "500 g", price: 110 },
  ],
  cumin: [{ name: "Cumin Seeds", size: "100 g", price: 45, isDefault: true }],
  potato: [{ name: "Potato", size: "1 kg", price: 40, isDefault: true }],
  "dosa-batter": [
    { name: "Dosa Batter", size: "1 kg", price: 80, isDefault: true },
    { name: "Millet Dosa Batter", size: "1 kg", price: 110 },
  ],
  chickpeas: [
    { name: "Kabuli Chana", size: "500 g", price: 75, isDefault: true },
    { name: "Boiled Chickpeas (Can)", size: "400 g", price: 95 },
  ],
  flour: [{ name: "Maida", size: "1 kg", price: 50, isDefault: true }],
  "milk-powder": [
    {
      name: "Full Cream Milk Powder",
      size: "200 g",
      price: 110,
      isDefault: true,
    },
  ],
  sugar: [{ name: "Fine Sugar", size: "1 kg", price: 60, isDefault: true }],
  cardamom: [
    { name: "Green Cardamom", size: "50 g", price: 70, isDefault: true },
  ],
  ghee: [
    { name: "Pure Cow Ghee", size: "200 ml", price: 150, isDefault: true },
  ],
  "rose-water": [
    { name: "Rose Water", size: "100 ml", price: 45, isDefault: true },
  ],
  "dark-chocolate": [
    {
      name: "Dark Baking Chocolate",
      size: "200 g",
      price: 140,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "70% Dark Couverture", size: "200 g", price: 220 },
  ],
  egg: [{ name: "Farm Fresh Eggs", size: "6 pcs", price: 65, isDefault: true }],
  "cocoa-powder": [
    {
      name: "Unsweetened Cocoa Powder",
      size: "100 g",
      price: 95,
      isDefault: true,
    },
  ],
  strawberries: [
    {
      name: "Fresh Strawberries",
      size: "250 g",
      price: 150,
      badge: "Seasonal",
      isDefault: true,
    },
    { name: "Frozen Strawberries", size: "300 g", price: 130 },
  ],
  "cream-cheese": [
    {
      name: "Classic Cream Cheese",
      size: "200 g",
      price: 180,
      isDefault: true,
    },
  ],
  biscuits: [
    { name: "Digestive Biscuits", size: "200 g", price: 80, isDefault: true },
  ],
  "ice-cream": [
    {
      name: "Vanilla Bean Ice Cream",
      size: "500 ml",
      price: 180,
      badge: "Best Value",
      isDefault: true,
    },
    { name: "Premium Belgian Chocolate", size: "500 ml", price: 230 },
  ],
  "chocolate-sauce": [
    {
      name: "Chocolate Dessert Sauce",
      size: "200 g",
      price: 120,
      isDefault: true,
    },
  ],
  "mixed-nuts": [
    { name: "Roasted Mixed Nuts", size: "100 g", price: 150, isDefault: true },
  ],
  mango: [
    {
      name: "Alphonso Mangoes",
      size: "2 pcs",
      price: 120,
      badge: "Seasonal",
      isDefault: true,
    },
  ],
  "condensed-milk": [
    {
      name: "Sweetened Condensed Milk",
      size: "400 g",
      price: 110,
      isDefault: true,
    },
  ],
  milk: [{ name: "Whole Milk", size: "1 L", price: 65, isDefault: true }],
  saffron: [
    { name: "Kashmiri Saffron", size: "1 g", price: 180, isDefault: true },
  ],
  mozzarella: [
    { name: "Pizza Mozzarella", size: "200 g", price: 140, isDefault: true },
  ],
  "pizza-base": [
    {
      name: "Thin Crust Pizza Bases",
      size: "2 pcs",
      price: 90,
      isDefault: true,
    },
  ],
  noodles: [
    { name: "Hakka Noodles", size: "400 g", price: 85, isDefault: true },
  ],
  cabbage: [
    { name: "Fresh Cabbage", size: "500 g", price: 30, isDefault: true },
  ],
  carrot: [
    { name: "Fresh Carrots", size: "500 g", price: 40, isDefault: true },
  ],
  "soy-sauce": [
    {
      name: "Naturally Brewed Soy Sauce",
      size: "150 ml",
      price: 55,
      isDefault: true,
    },
  ],
  ...EXTRA_PRODUCTS,
};

const RECIPES = [
  {
    slug: "chicken-biryani",
    name: "Chicken Biryani",
    description:
      "A flavorful and aromatic rice dish made with tender chicken, basmati rice, and a blend of traditional spices.",
    about:
      "Chicken Biryani is a rich and aromatic dish made with tender chicken, fragrant basmati rice, and a blend of spices. Perfect for family meals and special occasions.",
    image: "/images/chicken-biryani.jpg",
    cuisine: "Indian",
    tags: ["Indian", "Non-Vegetarian"],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: "Medium",

    calories: 520,
    protein: 32,
    carbs: 58,
    fat: 18,
    instructions: [
      "Marinate chicken with yogurt, ginger-garlic paste, spices and salt for at least 30 minutes.",
      "Soak basmati rice for 30 minutes, then parboil with whole spices until 70% cooked.",
      "Fry sliced onions until golden brown and set aside half for garnish.",
      "Cook marinated chicken with the fried onions and tomatoes until the oil separates.",
      "Layer rice over the chicken, top with mint, fried onions and saffron milk.",
      "Seal the pot and cook on dum (low heat) for 20 minutes. Rest 10 minutes before serving.",
    ],
    ingredients: [
      ["chicken", "500 g"],
      ["rice", "500 g"],
      ["onion", "3 pcs"],
      ["tomato", "2 pcs", "approx. 250 g"],
      ["ginger", "20 g"],
      ["garlic", "20 g"],
      ["mint", "20 g"],
      ["yogurt", "200 g"],
      ["spices", "whole & powder"],
    ],
  },
  {
    slug: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description:
      "Soft paneer cubes simmered in a silky, buttery tomato-cashew gravy.",
    about:
      "Paneer Butter Masala is a restaurant favourite: cubes of paneer in a creamy, mildly sweet tomato gravy finished with butter and cream. Pairs beautifully with naan or jeera rice.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    cuisine: "Indian",
    tags: ["Indian", "Vegetarian"],
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",

    calories: 410,
    protein: 16,
    carbs: 20,
    fat: 30,
    instructions: [
      "Sauté onions, tomatoes, ginger, garlic and cashews in butter until soft.",
      "Cool and blend to a smooth paste; strain for a silky texture.",
      "Cook the puree with spices until it thickens and glistens.",
      "Add paneer cubes, cream and kasuri methi; simmer 5 minutes.",
      "Finish with a knob of butter and serve hot.",
    ],
    ingredients: [
      ["paneer", "400 g"],
      ["tomato", "4 pcs"],
      ["onion", "2 pcs"],
      ["butter", "50 g"],
      ["cream", "100 ml"],
      ["ginger", "10 g"],
      ["garlic", "10 g"],
      ["spices", "powder"],
    ],
  },
  {
    slug: "veg-pasta",
    name: "Veg Pasta",
    description:
      "Penne tossed with colourful vegetables in a zesty tomato-garlic sauce.",
    about:
      "A quick weeknight pasta with crunchy bell peppers, juicy tomatoes and plenty of garlic. Ready in under 30 minutes and easily customisable.",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80",
    cuisine: "Italian",
    tags: ["Italian", "Quick", "Healthy", "Vegetarian"],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",

    calories: 380,
    protein: 12,
    carbs: 62,
    fat: 9,
    instructions: [
      "Boil penne in salted water until al dente; reserve a cup of pasta water.",
      "Sauté garlic and onion in olive oil, add bell peppers and cook until tender.",
      "Add chopped tomatoes, chilli flakes and herbs; simmer into a sauce.",
      "Toss pasta with the sauce, loosening with pasta water as needed.",
      "Serve with grated cheese and fresh basil.",
    ],
    ingredients: [
      ["pasta", "250 g"],
      ["bell-pepper", "2 pcs"],
      ["tomato", "3 pcs"],
      ["onion", "1 pc"],
      ["garlic", "15 g"],
      ["spices", "herbs & chilli"],
    ],
  },
  {
    slug: "dal-tadka",
    name: "Dal Tadka",
    description:
      "Comforting yellow lentils finished with a sizzling ghee tempering.",
    about:
      "Dal Tadka is everyday comfort food: creamy toor dal finished with a fragrant tempering of cumin, garlic and dried red chillies in ghee.",
    image: "https://images.unsplash.com/photo-1755090154817-58d9d36ec988?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0",
    cuisine: "Indian",
    tags: ["Indian", "Healthy", "Quick", "Vegetarian"],
    prepTime: 5,
    cookTime: 20,
    servings: 4,
    difficulty: "Easy",

    calories: 240,
    protein: 14,
    carbs: 32,
    fat: 7,
    instructions: [
      "Rinse dal and pressure cook with turmeric and salt until soft.",
      "Whisk the dal to a creamy consistency and simmer with chopped tomatoes.",
      "Heat ghee, crackle cumin, add garlic, onion and dried chillies.",
      "Pour the sizzling tadka over the dal and finish with coriander.",
    ],
    ingredients: [
      ["lentils", "250 g"],
      ["tomato", "2 pcs"],
      ["onion", "1 pc"],
      ["garlic", "15 g"],
      ["cumin", "1 tsp"],
      ["butter", "30 g"],
      ["spices", "powder"],
    ],
  },
  {
    slug: "masala-dosa",
    name: "Masala Dosa",
    description: "Crisp golden crepe wrapped around spiced potato filling.",
    about:
      "Masala Dosa is a South Indian classic: a thin, crispy fermented crepe filled with a turmeric-tinged potato masala. Serve with coconut chutney and sambar.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0",
    cuisine: "Indian",
    tags: ["Indian", "Quick", "Vegetarian"],
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: "Medium",

    calories: 330,
    protein: 8,
    carbs: 55,
    fat: 9,
    instructions: [
      "Boil and roughly mash potatoes.",
      "Temper mustard seeds, curry leaves, onions and turmeric; fold in potatoes.",
      "Spread batter thin on a hot tawa, drizzle oil and cook until golden.",
      "Place potato masala in the centre, fold and serve immediately.",
    ],
    ingredients: [
      ["dosa-batter", "500 g"],
      ["potato", "4 pcs"],
      ["onion", "2 pcs"],
      ["ginger", "10 g"],
      ["spices", "mustard & turmeric"],
    ],
  },
  {
    slug: "chole-bhature",
    name: "Chole Bhature",
    description: "Spicy chickpea curry served with puffy, golden fried bread.",
    about:
      "Chole Bhature is a Punjabi street food icon: tangy, dark chickpea curry paired with pillowy deep-fried bhature. A weekend brunch worth the effort.",
    image: "/images/chole-bhature.jpg",
    cuisine: "Indian",
    tags: ["Indian", "Vegetarian"],
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    difficulty: "Hard",

    calories: 610,
    protein: 18,
    carbs: 78,
    fat: 25,
    instructions: [
      "Soak chickpeas overnight and pressure cook with a tea bag until soft.",
      "Make an onion-tomato masala with ginger, garlic and chole spices.",
      "Add chickpeas and simmer until the gravy thickens.",
      "Knead maida with yogurt and rest for 2 hours; roll and deep fry bhature.",
      "Serve hot with sliced onions and pickle.",
    ],
    ingredients: [
      ["chickpeas", "300 g"],
      ["flour", "300 g"],
      ["onion", "2 pcs"],
      ["tomato", "3 pcs"],
      ["ginger", "15 g"],
      ["garlic", "15 g"],
      ["yogurt", "100 g"],
      ["spices", "chole masala"],
    ],
  },
  {
    slug: "butter-chicken",
    name: "Butter Chicken",
    description:
      "Tender tandoori-style chicken in a velvety tomato, butter and cream gravy.",
    about:
      "A much-loved North Indian curry with smoky marinated chicken, a mellow tomato sauce and a little cream. Serve with warm naan or steamed basmati rice.",
    image: "/images/butter-chicken.jpg",
    cuisine: "Indian",
    tags: ["Indian", "Dinner", "Non-Vegetarian"],
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    difficulty: "Medium",

    calories: 465,
    protein: 34,
    carbs: 18,
    fat: 29,
    instructions: [
      "Marinate chicken in yogurt, ginger-garlic paste, chilli and salt for 30 minutes.",
      "Sear the chicken in a hot pan until lightly charred and cooked through.",
      "Cook onion, tomatoes and spices in butter until soft, then blend until smooth.",
      "Return the sauce to the pan, fold in chicken and simmer gently for 10 minutes.",
      "Finish with cream and a little butter. Serve with naan or rice.",
    ],
    ingredients: [
      ["chicken", "500 g"],
      ["yogurt", "150 g"],
      ["tomato", "4 pcs"],
      ["onion", "1 pc"],
      ["butter", "50 g"],
      ["cream", "100 ml"],
      ["ginger", "15 g"],
      ["garlic", "15 g"],
      ["spices", "butter chicken masala"],
    ],
  },
  {
    slug: "hakka-noodles",
    name: "Veg Hakka Noodles",
    description:
      "Wok-tossed noodles with crisp vegetables, ginger and a savoury soy dressing.",
    about:
      "A quick, colourful Indo-Chinese favourite. Keep the wok hot and the vegetables crisp for that classic street-style finish.",
    image: "https://images.unsplash.com/photo-1789990662414-f607ba6405f3?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0",
    cuisine: "Chinese",
    tags: ["Chinese", "Quick", "Healthy", "Vegetarian"],
    prepTime: 15,
    cookTime: 10,
    servings: 3,
    difficulty: "Easy",

    calories: 340,
    protein: 10,
    carbs: 55,
    fat: 9,
    instructions: [
      "Boil noodles until just tender, rinse briefly and toss with a little oil.",
      "Heat a wok until very hot. Stir-fry ginger, garlic, carrot and capsicum for 2 minutes.",
      "Add shredded cabbage and toss until just wilted but still crisp.",
      "Add noodles and soy sauce; toss over high heat and serve straight away.",
    ],
    ingredients: [
      ["noodles", "300 g"],
      ["cabbage", "150 g"],
      ["carrot", "1 pc"],
      ["bell-pepper", "1 pc"],
      ["soy-sauce", "2 tbsp"],
      ["ginger", "10 g"],
      ["garlic", "10 g"],
    ],
  },
  {
    slug: "margherita-pizza",
    name: "Margherita Pizza",
    description:
      "A crisp, simple pizza topped with tomato, bubbling mozzarella and fragrant herbs.",
    about:
      "The Italian classic keeps it simple: bright tomato, stretchy mozzarella and dried herbs on a crisp base. Add fresh basil after baking if you have it.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    cuisine: "Italian",
    tags: ["Italian", "Quick", "Vegetarian"],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",

    calories: 390,
    protein: 18,
    carbs: 48,
    fat: 14,
    instructions: [
      "Heat the oven as high as it will go and warm a baking tray inside.",
      "Spread a thin layer of crushed tomato over each pizza base.",
      "Scatter mozzarella and dried herbs evenly over the top.",
      "Bake on the hot tray until the edges are crisp and the cheese is bubbling.",
    ],
    ingredients: [
      ["pizza-base", "2 pcs"],
      ["tomato", "3 pcs"],
      ["mozzarella", "200 g"],
      ["spices", "Italian herbs"],
    ],
  },
  {
    slug: "gulab-jamun",
    name: "Gulab Jamun",
    description:
      "Soft, golden milk dumplings soaked in a delicate cardamom and rose syrup.",
    about:
      "These melt-in-the-mouth Indian sweets are gently fried until golden, then soaked in warm rose-cardamom syrup. Let them rest so every bite turns beautifully soft.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Two_Gulab_Jamun_in_a_plate_01.jpg/1280px-Two_Gulab_Jamun_in_a_plate_01.jpg",
    cuisine: "Indian",
    tags: ["Indian", "Desserts"],
    prepTime: 25,
    cookTime: 25,
    servings: 6,
    difficulty: "Medium",

    calories: 285,
    protein: 5,
    carbs: 42,
    fat: 11,
    instructions: [
      "Warm sugar and water with crushed cardamom; finish the syrup with rose water.",
      "Mix milk powder and flour. Add yogurt a little at a time to make a soft dough.",
      "Shape smooth small balls, making sure there are no cracks.",
      "Fry slowly in warm ghee, turning gently, until evenly golden brown.",
      "Soak the warm dumplings in warm syrup for at least 45 minutes before serving.",
    ],
    ingredients: [
      ["milk-powder", "200 g"],
      ["flour", "50 g"],
      ["yogurt", "3 tbsp"],
      ["ghee", "500 ml"],
      ["sugar", "300 g"],
      ["cardamom", "4 pods"],
      ["rose-water", "1 tbsp"],
    ],
  },
  {
    slug: "rasmalai",
    name: "Rasmalai",
    description:
      "Delicate paneer dumplings in saffron-scented, slow-simmered milk.",
    about:
      "A celebration-worthy Bengali dessert: soft chenna discs resting in thickened milk with saffron, cardamom and pistachio. Chill well for the silkiest texture.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Rasmalai_3.jpg/1280px-Rasmalai_3.jpg",
    cuisine: "Indian",
    tags: ["Indian", "Desserts"],
    prepTime: 25,
    cookTime: 45,
    servings: 6,
    difficulty: "Medium",

    calories: 260,
    protein: 11,
    carbs: 34,
    fat: 9,
    instructions: [
      "Bring milk to a simmer and reduce gently until creamy, stirring often.",
      "Stir in sugar, saffron and crushed cardamom; keep the milk warm.",
      "Knead fresh paneer until smooth, shape into small discs and simmer in light sugar syrup.",
      "Transfer the soft discs into the saffron milk and chill for at least 2 hours.",
    ],
    ingredients: [
      ["paneer", "300 g"],
      ["milk", "1.5 L"],
      ["sugar", "150 g"],
      ["saffron", "a pinch"],
      ["cardamom", "4 pods"],
    ],
  },
  {
    slug: "chocolate-lava-cake",
    name: "Chocolate Lava Cake",
    description:
      "A tender cocoa cake with a warm, flowing dark-chocolate centre.",
    about:
      "Bake these little cakes just until their edges are set and centres still wobble. Turn out carefully and serve warm with a scoop of vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    cuisine: "Dessert",
    tags: ["Desserts", "Chocolate"],
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: "Medium",

    calories: 390,
    protein: 7,
    carbs: 44,
    fat: 22,
    instructions: [
      "Butter four small ramekins and dust lightly with cocoa powder.",
      "Melt dark chocolate and butter together until glossy, then cool slightly.",
      "Whisk eggs and sugar until pale, fold in chocolate, flour and cocoa.",
      "Divide between ramekins and bake until the edges are set but the centre stays soft.",
      "Rest for one minute, turn out and serve immediately with vanilla ice cream.",
    ],
    ingredients: [
      ["dark-chocolate", "180 g"],
      ["butter", "100 g"],
      ["egg", "3 pcs"],
      ["sugar", "100 g"],
      ["flour", "50 g"],
      ["cocoa-powder", "2 tbsp"],
      ["ice-cream", "4 scoops"],
    ],
  },
  {
    slug: "strawberry-cheesecake",
    name: "Strawberry Cheesecake",
    description:
      "Creamy baked cheesecake with a buttery biscuit crust and fresh berry topping.",
    about:
      "A smooth, gently tangy cheesecake with a crisp crumb base and glossy strawberries. Chill completely before slicing for clean, café-style pieces.",
    image: "https://images.unsplash.com/photo-1622621746668-59fb299bc4d7?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0",
    cuisine: "Dessert",
    tags: ["Desserts"],
    prepTime: 25,
    cookTime: 50,
    servings: 8,
    difficulty: "Medium",

    calories: 420,
    protein: 8,
    carbs: 39,
    fat: 27,
    instructions: [
      "Crush digestive biscuits and mix with melted butter; press into a lined tin.",
      "Beat cream cheese and sugar until smooth, then mix in eggs and cream.",
      "Pour over the crumb base and bake gently until the centre has a slight wobble.",
      "Cool fully, then chill for at least 4 hours.",
      "Top with fresh strawberries just before serving.",
    ],
    ingredients: [
      ["biscuits", "200 g"],
      ["butter", "80 g"],
      ["cream-cheese", "500 g"],
      ["sugar", "150 g"],
      ["egg", "2 pcs"],
      ["cream", "100 ml"],
      ["strawberries", "250 g"],
    ],
  },
  {
    slug: "ice-cream-sundae",
    name: "Classic Ice Cream Sundae",
    description:
      "Vanilla scoops, silky chocolate sauce, toasted nuts and bright fresh berries.",
    about:
      "A cheerful, no-cook dessert you can make your own. Layer the toppings just before serving to keep the nuts crunchy and the ice cream perfectly cold.",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80",
    cuisine: "Dessert",
    tags: ["Desserts", "Ice Cream", "Quick"],
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",

    calories: 350,
    protein: 7,
    carbs: 45,
    fat: 17,
    instructions: [
      "Chill two sundae glasses for ten minutes.",
      "Add generous scoops of vanilla ice cream to each glass.",
      "Drizzle with chocolate sauce and scatter over toasted mixed nuts.",
      "Finish with fresh strawberries and serve straight away.",
    ],
    ingredients: [
      ["ice-cream", "4 scoops"],
      ["chocolate-sauce", "4 tbsp"],
      ["mixed-nuts", "30 g"],
      ["strawberries", "100 g"],
    ],
  },
  {
    slug: "mango-kulfi",
    name: "Mango Kulfi",
    description:
      "Creamy no-churn mango kulfi with ripe Alphonso mango and cardamom.",
    about:
      "This easy freezer dessert tastes like summer. Blend sweet mango with condensed milk and cream, pour into moulds, and freeze until firm.",
    image: "https://images.unsplash.com/photo-1703763253190-4af44c87a23e?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0",
    cuisine: "Indian",
    tags: ["Indian", "Desserts", "Ice Cream"],
    prepTime: 15,
    cookTime: 5,
    servings: 6,
    difficulty: "Easy",

    calories: 245,
    protein: 5,
    carbs: 36,
    fat: 9,
    instructions: [
      "Warm the cream with crushed cardamom for a few minutes, then cool.",
      "Blend ripe mango flesh with condensed milk until smooth.",
      "Fold the mango mixture into the cooled cream.",
      "Pour into kulfi moulds and freeze for at least 6 hours.",
      "Dip the moulds briefly in warm water to unmould and serve.",
    ],
    ingredients: [
      ["mango", "3 pcs"],
      ["condensed-milk", "200 g"],
      ["cream", "200 ml"],
      ["cardamom", "3 pods"],
      ["sugar", "2 tbsp"],
    ],
  },
  {
    slug: "chocolate-chip-cookies",
    name: "Chocolate Chip Cookies",
    description:
      "Golden-edged, soft-centred cookies packed with chunks of dark chocolate.",
    about:
      "The best cookies are crisp at the edges and still soft in the middle. Chill the dough briefly before baking for thicker, chewier cookies.",
    image: "https://images.unsplash.com/photo-1782227149180-2d321c5042ed?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0",
    cuisine: "Dessert",
    tags: ["Desserts", "Chocolate"],
    prepTime: 15,
    cookTime: 12,
    servings: 12,
    difficulty: "Easy",

    calories: 210,
    protein: 3,
    carbs: 28,
    fat: 10,
    instructions: [
      "Cream softened butter and sugar until light and fluffy.",
      "Beat in the egg, then fold in flour and chopped dark chocolate.",
      "Chill the dough for 20 minutes while the oven heats.",
      "Scoop onto a lined tray, leaving space for spreading.",
      "Bake until the edges are golden; cool on the tray before serving.",
    ],
    ingredients: [
      ["butter", "125 g"],
      ["sugar", "150 g"],
      ["egg", "1 pc"],
      ["flour", "200 g"],
      ["dark-chocolate", "150 g"],
    ],
  },
  ...EXTRA_RECIPES,
];

let seeded = false;
let inflight = null;

export async function ensureSeeded() {
  if (seeded) return;
  if (!inflight) {
    inflight = seedWithLock().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

async function seedWithLock() {
  await db.transaction(async (tx) => {
    // Serialize additive seeding across requests and server workers.
    await tx.execute(sql`select pg_advisory_xact_lock(727272)`);
    await runSeed(tx);
  });
  seeded = true;
}

async function runSeed(tx) {
  const favoritesResetKey = "clear-existing-saved-recipes-2026-10-10-v4";
  const [favoritesReset] = await tx
    .select({ key: appMigrations.migrationName })
    .from(appMigrations)
    .where(eq(appMigrations.migrationName, favoritesResetKey))
    .limit(1);
  if (!favoritesReset) {
    await tx.execute(sql`delete from favorites`);
    await tx
      .insert(appMigrations)
      .values({ migrationName: favoritesResetKey });
  }

  await tx.insert(ingredients).values(INGREDIENTS).onConflictDoNothing();
  const allIngredients = await tx
    .select({ id: ingredients.id, slug: ingredients.slug })
    .from(ingredients);
  const ingBySlug = new Map(allIngredients.map((i) => [i.slug, i.id]));

  const productRows = Object.entries(PRODUCTS).flatMap(([slug, list]) =>
    list.flatMap((p) => {
      const ingredientId = ingBySlug.get(slug);
      return ingredientId == null
        ? []
        : [
            {
              ingredientId,
              name: p.name,
              size: p.size,
              price: p.price,
              badge: p.badge ?? null,
              isDefault: p.isDefault ?? false,
            },
          ];
    }),
  );
  if (productRows.length)
    await tx.insert(products).values(productRows).onConflictDoNothing();

  const existingRecipes = new Set(
    (await tx.select({ slug: recipes.slug }).from(recipes)).map((r) => r.slug),
  );
  for (const r of RECIPES) {
    if (existingRecipes.has(r.slug)) {
      await tx
        .update(recipes)
        .set({
          image: r.image,
          tags: [...r.tags],
        })
        .where(eq(recipes.slug, r.slug));
      continue;
    }
    const [rec] = await tx
      .insert(recipes)
      .values({
        slug: r.slug,
        name: r.name,
        description: r.description,
        about: r.about,
        image: r.image,
        cuisine: r.cuisine,
        tags: [...r.tags],
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        difficulty: r.difficulty,
        instructions: [...r.instructions],
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
      })
      .returning();
    if (!rec) continue;
    await tx.insert(recipeIngredients).values(
      r.ingredients.flatMap((ri, idx) => {
        const ingredientId = ingBySlug.get(ri[0]);
        return ingredientId == null
          ? []
          : [
              {
                recipeId: rec.id,
                ingredientId,
                quantity: ri[1],
                note: ri[2] ?? null,
                position: idx,
              },
            ];
      }),
    );
  }
}
