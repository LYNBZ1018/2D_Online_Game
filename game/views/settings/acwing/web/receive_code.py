from django.shortcuts import redirect

def receive_code(request):
    data = request.GET
    code = data.get('code')  # 授权code
    state = data.get('state')  # 对暗号

    print(code, state)  # 用于测试

    return redirect("index")  # 返回重定向的链接
