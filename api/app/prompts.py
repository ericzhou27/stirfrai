from helm.common.authentication import Authentication
from helm.common.perspective_api_request import PerspectiveAPIRequest, PerspectiveAPIRequestResult
from helm.common.request import Request, RequestResult
from helm.common.tokenization_request import TokenizationRequest, TokenizationRequestResult
from helm.proxy.accounts import Account
from helm.proxy.services.remote_service import RemoteService

import json
import random

from helm_auth import service

model = 'openai/text-davinci-003'

def prompt_response(auth, prompt, randomness=False):
    seed = ''
    if randomness:
        seed = str(random.random())
    request = Request(model=model, prompt=prompt, echo_prompt=False, max_tokens=500, stop_sequences=['ENDMEALPLAN'], random=seed)
    request_result = service.make_request(auth, request)
    text = request_result.completions[0].text
    try:
        return json.loads(text)
    except ValueError as e:
        return text

def macros_prompt(height, weight, goal):
    return f'''I'm {height} and {weight}.  I want to {goal}.  Give me approximate integer values for how much carbs, protein, fat, and calories per day I should be eating.  The carbs, protein, and fat should be in grams.  These values should be very carefully tailored to my height, weight, and goal.  Provide this in JSON format where there is a key-value pair for each value requested. All keys should be lowercase.  All values should be integers, not strings.  After providing the JSON, print ENDMEALPLAN.'''

def meal_plan_prompt(carbs, protein, fat, calories):
    return f'''I need {carbs}g carbs per day, {protein}g protein per day, {fat}g fat per day, and {calories} calories per day.  Give me names of dishes for breakfast, lunch, and dinner.  Each dish should have protein and carbs.  Altogether, these meals should satisfy these carbs, protein, fat, and calories requirements.  The nutrients should be balanced across all 3 meals.  Provide them in JSON format of a list of strings where the strings are dish names, and no other information.  There should only be three list items.  After providing the JSON, print ENDMEALPLAN.'''

def meal_detail_prompt(carbs, protein, fat, calories, meal1, meal2, meal3):
    return f'''My list of meals is as follows:
1. {meal1}
2. {meal2}
3. {meal3}
Give me the carbs, fat, protein, and calories of each meal.  The sum total number of carbs should be {carbs}.  The sum total number of fat should be {fat}.  The sum total number of protein should be {protein}.  The sum total number of calories should be {calories}.  These values should be roughly balanced across all three meals, and also should be realistic for each meal.  Return a JSON list of dictionaries where each dictionary has keys carbs, fat, protein, and calories.  Use double quotes, not single quotes.  After providing the JSON, print ENDMEALPLAN.'''

def meal_ingredients_prompt(recipe):
    return f'''{recipe}
    
Provide a list of all ingredients necessary to cook the above recipe based on both the ingredients list and the instructions.  Provide it in JSON format where each entry is a list of two elements: ingredient name and ingredient amount (may be in cups, count, grams, etc.).  Do not include ingredients not in the recipe.  Include all ingredients in the recipe.  Make sure the output is valid JSON.  When that is completed, print ENDMEALPLAN.'''

def meal_recipe_prompt(dish, carbs, fat, protein, calories):
    return f'''Please provide a recipe for "{dish}".  The meal should contain {carbs}g carbs, {fat}g fat, {protein}g protein, and {calories} calories.  Keep track of these requirements by listing each ingredient's nutritional values (fat, protein, carbs, and calories) and making sure they sum to the required values.  Increase the number of servings if necessary.  After listing recipe instructions, print ENDMEALPLAN.'''

def meal_recipe_clean_prompt(recipe):
    return f'''{recipe}
Remove nutritional values from the ingredients list.  Preserve the ingredients list and recipe.
    '''

def detailed_meal_macros_prompt(recipe):
    return f'''{recipe}
Provide the fat, carbs, and protein (all in grams), as well as the calories, in this meal, based on the ingredients list.  Provide it in JSON format where each key is one of the requested elements.  Values should all be integers.  When that is completed, print ENDMEALPLAN.
    '''