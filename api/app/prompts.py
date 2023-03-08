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

# thanks to chatgpt so I didn't have to write this myself lol
def human_readable_list(list_of_strings, and_or=False):
    conjunction = 'and'
    if and_or:
        conjunction = 'and/or'
    if len(list_of_strings) == 0:
        return ''
    elif len(list_of_strings) == 1:
        return list_of_strings[0]
    elif len(list_of_strings) == 2:
        return f"{list_of_strings[0]} and {list_of_strings[1]}"
    else:
        return f"{', '.join(list_of_strings[:-1])}, {conjunction} {list_of_strings[-1]}"

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

def meal_plan_prompt(carbs, protein, fat, calories, likes, dislikes, minutes, stars):
    likes_list = ', '.join(likes)
    dislikes_list = human_readable_list(dislikes)

    likes_string = ''
    dislikes_string = ''
    if likes:
        likes_string = f'  Occasionally include meals that have some but not all of the following: {likes_list}.'
    if dislikes:
        dislikes_string = f'  Do not include meals that use {dislikes_list}.'

    time_string = ''
    if minutes:
        time_string = f'  Meals must take less than {minutes} minutes to prepare.'

    ability_string = ''
    if stars:
        ability_string = f'Meals must be preparable by someone who is a {stars} out of 5 in cooking ability.'

    return f'''Provide semi-detailed meal names (not ingredient lists) for breakfast, lunch, and dinner, in that order.  Altogether, the meals need to provide {carbs}g carbs per day, {protein}g protein per day, {fat}g fat per day, and {calories} calories per day.{likes_string}{dislikes_string}  Do not include meals with ingredients that don't go together.  The meals must be reasonable and taste good to the average American.{time_string}{ability_string}  Provide them in valid JSON: a list of strings where the strings are meal names, and no other information.  There should only be three list items.  Do not include breakfast, lunch, or dinner in the meal names.  The JSON list should be valid JSON, including starting and ending brackets.  Do not include newlines or other invalid characters.  After the JSON concludes with a closing bracket, print ENDMEALPLAN.'''

def meal_detail_prompt(carbs, protein, fat, calories, meal1, meal2, meal3):
    return f'''My list of meals is as follows:
1. {meal1}
2. {meal2}
3. {meal3}
Give me the carbs, fat, protein, and calories of each meal.  The sum total number of carbs should be {carbs}.  The sum total number of fat should be {fat}.  The sum total number of protein should be {protein}.  The sum total number of calories should be {calories}.  These values should be roughly balanced across all three meals, and also should be realistic for each meal.  Return a JSON list of dictionaries where each dictionary has keys carbs, fat, protein, and calories.  Use double quotes, not single quotes.  After providing the JSON, print ENDMEALPLAN.'''

def meal_ingredients_prompt(recipe):
    return f'''{recipe}
    
Provide a list of all ingredients necessary to cook the above recipe based on both the ingredients list and the instructions.  Provide it in JSON format where each entry is a list of two elements: ingredient name and ingredient amount (may be in cups, count, grams, etc.).  Do not include ingredients not in the recipe.  Include all ingredients in the recipe.  Make sure the output is valid JSON.  Make sure all strings are wrapped in double quotation marks.  When that is completed, print ENDMEALPLAN.'''

def meal_recipe_prompt(dish, carbs, fat, protein, calories, minutes, stars):
    time_string = ''
    if minutes:
        time_string = f'  The recipe must take less than {minutes} minutes to prepare.'

    ability_string = ''
    if stars:
        ability_string = f'The recipe must be preparable by someone who is a {stars} out of 5 in cooking ability.'

    return f'''Please provide a recipe for "{dish}".{time_string}{ability_string}  The meal should contain {carbs}g carbs, {fat}g fat, {protein}g protein, and {calories} calories.  Keep track of these requirements by listing each ingredient's nutritional values (fat, protein, carbs, and calories) and making sure they sum to the required values.  Increase the number of servings if necessary.  After listing recipe instructions, print ENDMEALPLAN.'''

def meal_recipe_clean_prompt(recipe):
    return f'''{recipe}
Remove nutritional values from the ingredients list.  Preserve the ingredients list and recipe.
    '''

def detailed_meal_macros_prompt(recipe):
    return f'''{recipe}
Provide the fat, carbs, and protein (all in grams), as well as the calories, in this meal, based on the ingredients list.  Provide it in JSON format where each key is one of the requested elements.  Values should all be integers.  When that is completed, print ENDMEALPLAN.
    '''

def meal_modification_prompt(meal, likes, dislikes):
    likes_list = human_readable_list(likes)
    dislikes_list = human_readable_list(dislikes)

    likes_string = ''
    dislikes_string = ''
    if likes:
        likes_string = f'  I like {likes_list}, but these are not requirements.'
    if dislikes:
        dislikes_string = f'  Do not include {dislikes_list}.'
    return f'''I currently have the meal {meal}.  I don't want it, so provide the name of a totally different meal for me.{likes_string}{dislikes_string}  After providing the name, print ENDMEALPLAN.'''
