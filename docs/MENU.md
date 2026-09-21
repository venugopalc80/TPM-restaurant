# TPM Restaurant Demo Menu

The supplied English and Indian menus are being treated as structured data for the restaurant ordering platform.

## Menu structure

English:
- Starters
- Mains
- Sides

Indian:
- Starters
- Chicken Dishes
- Lamb Dishes
- Vegetarian
- Rice
- Indian Breads
- Desserts

Each item stores its name, description, price, allergens, dietary tags, spice level and availability.

## Allergen safety

This is demo data. Before production use, every allergen claim must be verified against the restaurant's actual recipes, ingredients, suppliers and preparation procedures, including cross-contact.

## AI ordering rule

The voice agent must query the structured menu and backend validation. It must never invent menu items, prices or allergen information.

## Planned filters

- Vegetarian
- Vegan
- Gluten-free, only after verified data
- Dairy-free, only after verified data
- Nut-free, only after verified data
- Spice level
