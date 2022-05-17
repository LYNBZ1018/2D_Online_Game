from django.http import JsonResponse
from urllib.parse import quote  # 引入 用于把链接中的特殊字符如空格转换成别的表示方式的工具
from random import randint  # 引入生成随机数的
from django.core.cache import cache

def get_state():  # 获取一个8位的随机数
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "1832"
    redirect_uri = quote("https://app1832.acapp.acwing.com.cn/settings/acwing/web/receive_code/")  # 重定向链接 收到授权码之后的跳转
    scope = "userinfo"  # 申请授权范围
    state = get_state()  # 获取一个暗号

    cache.set(state, True, 7200)  # 将state放到redis中 有效期为2h

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({  # 返回请求
        'result': "success",  # 测试
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })
