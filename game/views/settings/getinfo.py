from django.http import JsonResponse
from game.models.player.player import Player



def getinfo_acapp(request):
    player = Player.objects.all()[0]  # 取出数据库中第一个用户
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })



def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:  # 未登录
        return JsonResponse({
            'result': "not login"
        })
    else:
        player = Player.objects.get(user=user)  # 取出数据库中第一个用户
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })



def getinfo(request):
    platform = request.GET.get('platform')  # 根据请求平台的不同 进行不同的处理
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)

