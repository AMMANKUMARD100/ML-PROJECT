from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, UserProfileView, SaveDetectionDocumentView, DeleteAccountView, UserDetectionDocumentsView, DocumentDetailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('audio_detection.urls')),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/user/profile/", UserProfileView.as_view(), name="user_profile"),
    path("api/user/delete/", DeleteAccountView.as_view(), name="delete_account"),
    path('api/save_detection_document/', SaveDetectionDocumentView.as_view(), name='save_detection_document'),
    path('api/user_detection_documents/', UserDetectionDocumentsView.as_view(), name='user_detection_documents'),
    path("api/detection_documents/<int:id>/", DocumentDetailView.as_view(), name="document-detail"),
]