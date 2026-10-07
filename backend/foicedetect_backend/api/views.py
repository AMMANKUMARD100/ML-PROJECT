from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import DetectionDocument

from django.core.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import DetectionDocumentSerializer
from django.http import JsonResponse

from django.utils import timezone 


from django.core.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import DetectionDocumentSerializer
from django.http import JsonResponse

from django.utils import timezone 


# Create your views here.
class CreateUserView(generics.CreateAPIView):
  queryset = User.objects.all()
  serializer_class = UserSerializer
  permission_classes = [AllowAny]


class UserProfileView(APIView):
  permission_classes = [IsAuthenticated]  # Ensures only logged-in users can access this view

  def get(self, request):
    user = request.user  # Get the current authenticated user
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }

    return Response(user_data, status=status.HTTP_200_OK)

# class DeleteAccountView(APIView):
#   permission_classes = [IsAuthenticated]

#   def delete(self, request):
#     user = request.user
#     user.is_active = False  # Deactivate the account
#     user.save()
#     return Response({"message": "Your account has been deactivated."}, status=status.HTTP_200_OK)

class DeleteAccountView(APIView):
  permission_classes = [IsAuthenticated]  # Ensures only authenticated users can access this

  def delete(self, request):
    user = request.user  # Get the authenticated user
    user.delete()  # Delete the user's account
    return Response({"message": "Your account has been successfully deleted."}, status=status.HTTP_204_NO_CONTENT)
  
# @csrf_exempt
class SaveDetectionDocumentView(APIView):
  permission_classes = [IsAuthenticated]
  parser_classes = (MultiPartParser, FormParser)  # Allow file upload

  def post(self, request):
    if not request.user.is_authenticated:
      return JsonResponse({'error': 'Authentication required'}, status=401)

    # Extract data from the request
    recording_name = request.data.get('fileName')
    name = request.data.get('name')
    is_genuine = request.data.get("result")
    confidence_score_raw = request.data.get("confidence")
    ai_analysis = request.data.get("details")
    reply = request.data.get("reply")

    try:
        confidence_score = float(confidence_score_raw) if confidence_score_raw not in [None, ""] else None
    except (TypeError, ValueError):
        return Response({"error": "Confidence score must be a valid number."}, status=400)

    # Validate the presence of required data

    if not name:
        return Response({"error": "Document name is required."}, status=400)
    
    if not recording_name:
        return Response({"error": "Recording name is missing."}, status=400)
    
    # if not is_genuine:
    #     return Response({"error": "Detection result is missing."}, status=400)
    
    # if not confidence_score:
    #     return Response({"error": "Confidence score is required."}, status=400)
    
    # if not ai_analysis:
    #     return Response({"error": "Analysis is missing."}, status=400)

    # Try to create and save the document
    try:
        document = DetectionDocument.objects.create(
            user=request.user,  # Associating the document with the current authenticated user
            name=name,
            recording_name=recording_name,
            is_genuine=is_genuine,
            confidence_score=confidence_score,
            ai_analysis=ai_analysis,
            reply=reply,
            created_at=timezone.now()
            # file=file
        )
        serializer = DetectionDocumentSerializer(document)
        return Response({"message": "Document uploaded successfully!", "document":serializer.data}, status=201)

    except ValidationError as e:
        return Response({"error": f"Validation error: {str(e)}"}, status=400)
    
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=500)
    
class UserDetectionDocumentsView(APIView):
  permission_classes = [IsAuthenticated]

  def get(self, request):
    user = request.user
    user_documents = DetectionDocument.objects.filter(user=user)
    serializer = DetectionDocumentSerializer(user_documents, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)
  
class DocumentDetailView(generics.RetrieveAPIView):
    queryset = DetectionDocument.objects.all()
    serializer_class = DetectionDocumentSerializer
    lookup_field = 'id'