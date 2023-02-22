from helm.common.authentication import Authentication
from helm.common.perspective_api_request import PerspectiveAPIRequest, PerspectiveAPIRequestResult
from helm.common.request import Request, RequestResult
from helm.common.tokenization_request import TokenizationRequest, TokenizationRequestResult
from helm.proxy.accounts import Account
from helm.proxy.services.remote_service import RemoteService

import json

from helm_auth import service

model = 'openai/text-davinci-003'

def prompt_response(auth, prompt):
    request = Request(model=model, prompt=prompt, echo_prompt=False, max_tokens=500, stop_sequences=['ENDMEALPLAN'])
    request_result = service.make_request(auth, request)
    text = request_result.completions[0].text
    try:
        return json.loads(text)
    except ValueError as e:
        return text

def macros_prompt(height, weight, goal):
    return f'''I'm {height} and {weight}.  I want to {goal}.  Give me approximate integer values for how much carbs, protein, fat, and calories per day I should be eating.  The carbs, protein, and fat should be in grams.  These values should be very carefully tailored to my height, weight, and goal.  Provide this in JSON format where there is a key-value pair for each value requested. All keys should be lowercase.  All values should be integers, not strings.  After providing the JSON, print ENDMEALPLAN.'''

def meal_plan_prompt(carbs, protein, fat, calories):
    return f'''I need {carbs}g carbs per day, {protein}g protein per day, {fat}g fat per day, and {calories} calories per day.  Give me a meal plan for the next 7 days.  Provide meals as a JSON list of 7 entries, where each entry is a JSON list of breakfast, lunch, and dinner for the day.  There should be no dictionaries.  Make sure that each day's meals satisfy my daily requirements.  Be sure that the result is valid JSON with double quotes, not single quotes.  After providing the JSON, print ENDMEALPLAN.'''

def meal_detail_prompt(carbs, protein, fat, calories, meal1, meal2, meal3):
    return f'''I need {carbs}g carbs per day, {protein}g protein per day, {fat}g fat per day, and {calories} calories per day.  I have the following meals planned for today to meet these goals:
    1. {meal1}
    2. {meal2}
    3. {meal3}
    Provide, in JSON format, a list of dictionaries, where each dictionary corresponds to the meal has keys carbs, fat, protein, calories, and cost.  Make sure the carbs, fat, protein, and calories satisfy my daily requirements.  Make sure the cost is realistic for the meal.  After providing the JSON, print ENDMEALPLAN.'''

def meal_ingredients_prompt(dish, carbs, fat, protein, calories, cost):
    return f'''Please provide a list of all ingredients necessary to cook the dish "{dish}".  Provide it in JSON format where each entry is a list of two elements: ingredient name and ingredient amount (may be in cups, count, grams, etc.).  Be sure that the ingredients all together have about {carbs}g carbs, {fat}g fat, {protein}g protein, {calories} calories, and costs about ${cost}.  Make sure that a recipe can be generated from these ingredients, and no more ingredients are necessary.  When that is completed, print ENDMEALPLAN.'''

def meal_recipe_prompt(ingredient_list, dish):
    ingredients = ''
    for a, b in ingredient_list:
        ingredients += f'{b} {a}, '
    ingredients = ingredients[:-2]
    return f'''Please provide a recipe for the dish "{dish}" that uses the following ingredients: {ingredients}.  When that is completed, print ENDMEALPLAN.'''
