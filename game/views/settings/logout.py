from django.http import jsonResponse
from django.contrib.auth import logout


def singout(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "success",
        });
    logout(request)
    return JsonResponse({
        'result': "success",
    })
