# video_annotation/models.py

from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.conf import settings
import random

def random_color():
    return f"#{random.randint(0, 0xFFFFFF):06x}"

class Video(models.Model):
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='videos', on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Tag(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default=random_color)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='tags', on_delete=models.CASCADE)

    class Meta:
        unique_together = ['name', 'user']

    def __str__(self):
        return self.name

class Annotation(models.Model):
    video = models.ForeignKey(Video, related_name='annotations', on_delete=models.CASCADE)
    timestamp = models.FloatField(validators=[MinValueValidator(0.0)])
    tag = models.ForeignKey(Tag, related_name='annotations', on_delete=models.CASCADE)
    x = models.FloatField(validators=[MinValueValidator(0.0)], default=0.0)
    y = models.FloatField(validators=[MinValueValidator(0.0)], default=0.0)
    width = models.FloatField(validators=[MinValueValidator(0.0)], default=0.0)
    height = models.FloatField(validators=[MinValueValidator(0.0)], default=0.0)
    created_at = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='annotations', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.tag} at {self.timestamp}s in {self.video.title}"