from flask import Flask
from flask import request

app = Flask(__name__)

from helm_auth import autobalance, service

from prompts import (
    prompt_response,
    macros_prompt,
    meal_plan_prompt,
    meal_detail_prompt,
    meal_ingredients_prompt,
    meal_recipe_prompt,
)

@app.route('/')
def usage():
    auth = autobalance()

    account = service.get_account(auth)

    used = account.usages['gpt3']['total'].used
    quota = account.usages['gpt3']['total'].quota
    percent = (used / quota) * 100
    return {'used': used, 'quota': quota, 'percent': percent}

@app.route('/macros')
def macros():
    auth = autobalance()

    height = request.args.get('height', type=str)
    weight = request.args.get('weight', type=str)
    goal = request.args.get('goal', type=str)

    prompt = macros_prompt(height, weight, goal)

    response = prompt_response(auth, prompt)

    return response

@app.route('/mealplan')
def mealplan():
    auth = autobalance()

    carbs = request.args.get('carbs', type=int)
    protein = request.args.get('protein', type=int)
    fat = request.args.get('fat', type=int)
    calories = request.args.get('calories', type=int)

    prompt = meal_detail_prompt(carbs, protein, fat, calories)

    response = prompt_response(auth, prompt)

    return response

@app.route('/meal-macros')
def meal_macros():
    auth = autobalance()

    carbs = request.args.get('carbs', type=int)
    protein = request.args.get('protein', type=int)
    fat = request.args.get('fat', type=int)
    calories = request.args.get('calories', type=int)

    meal1 = request.args.get('meal1', type=str)
    meal2 = request.args.get('meal2', type=str)
    meal3 = request.args.get('meal3', type=str)

    prompt = meal_plan_prompt(carbs, protein, fat, calories, meal1, meal2, meal3)

    response = prompt_response(auth, prompt)

    return response

@app.route('/ingredients')
def ingredients():
    auth = autobalance()

    carbs = request.args.get('carbs', type=int)
    protein = request.args.get('protein', type=int)
    fat = request.args.get('fat', type=int)
    calories = request.args.get('calories', type=int)
    cost = request.args.get('cost', type=float)

    dish = request.args.get('dish', type=str)

    prompt = meal_ingredients_prompt(dish, carbs, fat, protein, calories, cost)

    response = prompt_response(auth, prompt)

    return response

@app.route('/recipe')
def recipe():
    auth = autobalance()

    ingredient_list = request.args.getlist('ingredient')
    dish = request.args.get('dish', type=str)

    prompt = meal_recipe_prompt(ingredient_list, dish)

    response = prompt_response(auth, prompt)

    return response
    

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=8080)
