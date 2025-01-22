import requests
from django.http import JsonResponse, HttpResponseRedirect
from . import settings
import logging

# Redirect to Channeli OAuth login
logger = logging.getLogger(__name__)

def channeli_login(request):
    try:
        # Construct the Channeli authorization URL
        auth_url = (
            f"{settings.CHANNELI_AUTH_URL}"
            f"?client_id={settings.CHANNELI_CLIENT_ID}"
            f"&redirect_uri={settings.CHANNELI_REDIRECT_URI}"
            f"&response_type=code"
            f"&scope=basic"  # Optional: Specify required scopes
        )
        
        # Log the generated URL for debugging
        logger.info(f"Redirecting to Channeli auth URL: {auth_url}")
        
        return HttpResponseRedirect(auth_url)
    except Exception as e:
        # Log errors for debugging
        logger.error(f"Error in channeli_login view: {str(e)}")
        return HttpResponseRedirect("/error")  # Redirect to an error page

# Handle Channeli OAuth callback
def channeli_callback(request):
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'Authorization code not found'}, status=400)

    # Exchange authorization code for access token
    token_response = requests.post(settings.CHANNELI_TOKEN_URL, data={
        'client_id': settings.CHANNELI_CLIENT_ID,
        'client_secret': settings.CHANNELI_CLIENT_SECRET,
        'redirect_uri': settings.CHANNELI_REDIRECT_URI,
        'grant_type': 'authorization_code',
        'code': code,
    })

    if token_response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch access token'}, status=400)

    access_token = token_response.json().get('access_token')

    # Fetch user profile from Channeli
    profile_response = requests.get(
        settings.CHANNELI_PROFILE_URL,
        headers={'Authorization': f'Bearer {access_token}'}
    )

    if profile_response.status_code != 200:
        return JsonResponse({'error': 'Failed to fetch user profile'}, status=400)

    user_data = profile_response.json()

    # Process user data (e.g., create or log in user)
    # For simplicity, just return the profile for now
    return JsonResponse({'user': user_data})
