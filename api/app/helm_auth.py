from helm.common.authentication import Authentication
from helm.common.perspective_api_request import PerspectiveAPIRequest, PerspectiveAPIRequestResult
from helm.common.request import Request, RequestResult
from helm.common.tokenization_request import TokenizationRequest, TokenizationRequestResult
from helm.proxy.accounts import Account
from helm.proxy.services.remote_service import RemoteService

import json
import os

api_keys = os.environ.get('CRFM_KEYS').split(',')

service = RemoteService("https://crfm-models.stanford.edu")

def autobalance():
    min_used = float('inf')
    best_auth = None
    total_usage = 0
    total_quota = 0
    for key in api_keys:
        auth = Authentication(api_key=key)

        account = service.get_account(auth)

        used = account.usages['gpt3']['total'].used
        if min_used >= used:
            min_used = used
            best_auth = auth
        total_usage += used
        total_quota += account.usages['gpt3']['total'].quota
    return best_auth, total_usage, total_quota
