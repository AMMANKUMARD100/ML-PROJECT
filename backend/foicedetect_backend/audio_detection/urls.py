from django.urls import path
from . import views

urlpatterns = [
    path('detect/', views.detect_audio, name='detect_audio'),
    path('reply/', views.reply, name='reply'),
    path('status/', views.health_status, name='health_status'),
]