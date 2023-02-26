from flask import Flask
from flask import request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)

from helm_auth import autobalance, service

from prompts import (
    prompt_response,
    macros_prompt,
    meal_plan_prompt,
    meal_detail_prompt,
    meal_ingredients_prompt,
    meal_recipe_prompt,
    meal_recipe_clean_prompt,
)

# localhost:8080
@app.route('/')
def usage():
    auth, used, quota = autobalance()

    account = service.get_account(auth)

    percent = (used / quota) * 100
    return {'used': used, 'quota': quota, 'percent': percent}

# localhost:8080/macros?height=6'&weight=160 lbs&goal=gain muscle
@app.route('/macros')
def macros():
    auth, used, quota = autobalance()

    height = request.args.get('height', type=str)
    weight = request.args.get('weight', type=str)
    goal = request.args.get('goal', type=str)

    prompt = macros_prompt(height, weight, goal)

    response = prompt_response(auth, prompt)

    return response

# localhost:8080/mealplan?carbs=340&fat=75&calories=2100&protein=175
@app.route('/mealplan')
def mealplan():
    auth, used, quota = autobalance()

    carbs = request.args.get('carbs', type=int)
    protein = request.args.get('protein', type=int)
    fat = request.args.get('fat', type=int)
    calories = request.args.get('calories', type=int)

    prompt = meal_plan_prompt(carbs, protein, fat, calories)

    response = []
    for i in range(7):
         response.append(prompt_response(auth, prompt, randomness=True))

    return response

# localhost:8080/mealmacros?carbs=340&fat=75&calories=2100&protein=175&meal1=Oatmeal with Skimmed Milk, Walnut & Blueberries&meal2=Roast Chicken Salad Bowl with Mixed Greens & Sweet Potatoes&meal3=Grilled Salmon with Brown Rice & Broccoli
@app.route('/mealmacros')
def meal_macros():
    auth, used, quota = autobalance()

    carbs = request.args.get('carbs', type=int)
    protein = request.args.get('protein', type=int)
    fat = request.args.get('fat', type=int)
    calories = request.args.get('calories', type=int)

    meal1 = request.args.get('meal1', type=str)
    meal2 = request.args.get('meal2', type=str)
    meal3 = request.args.get('meal3', type=str)

    prompt = meal_detail_prompt(carbs, protein, fat, calories, meal1, meal2, meal3)

    response = prompt_response(auth, prompt)

    return response

# localhost:8080/recipe?carbs=120&fat=25&calories=850&protein=75&dish=Roast Chicken Salad Bowl with Mixed Greens %26 Sweet Potatoes
@app.route('/recipe')
def recipe():
    auth, used, quota = autobalance()

    dish = request.args.get('dish', type=str)
    carbs = request.args.get('carbs', type=int)
    protein = request.args.get('protein', type=int)
    fat = request.args.get('fat', type=int)
    calories = request.args.get('calories', type=int)

    prompt = meal_recipe_prompt(dish, carbs, fat, protein, calories)

    response = prompt_response(auth, prompt)

    return response

# localhost:8080/recipe?recipe=<...recipe...>
@app.route('/ingredients')
def ingredients():
    auth, used, quota = autobalance()

    recipe = request.args.get('recipe', type=str)

    prompt = meal_ingredients_prompt(recipe)

    response = prompt_response(auth, prompt)

    return response


if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8080)
