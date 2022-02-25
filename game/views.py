from django.http import HttpResponse


def index(request):
    line1 = '<h1 style="text-align: center">术士之战</h1>'
    line2 = '<a href="/play/">进入游戏开始界面</a>'
    line3 = '<hr>'
    line4 = '<img src="https://img1.baidu.com/it/u=646372387,2566474310&fm=253&fmt=auto&app=138&f=JPEG?w=888&h=500" width=1500>'
    return HttpResponse(line1 + line2 + line3 + line4)


def play(request):
    line1 = '<h1 style="text-align: center">游戏界面</h1>'
    line2 = '<a href="/">返回主页面</a>'
    line3 = '<hr>'
    line4 = '<img src="https://img1.baidu.com/it/u=1237558410,2909084163&fm=253&fmt=auto&app=138&f=JPEG?w=547&h=343" width=1500>'
    return HttpResponse(line1 + line2 + line3 + line4)
