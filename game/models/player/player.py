from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    #每一个user对应一个player
    #当user被删除时，player也被级联删除

    photo = models.URLField(max_length=256, blank=True)
    openid = models.CharField(default="", max_length=50, blank=True, null = True)

    def __str__(self):
        return str(self.user)

