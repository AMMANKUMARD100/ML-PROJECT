from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class DetectionDocument(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="detectionDocs")
  name = models.CharField(max_length=200, null=True)
  recording_name = models.CharField(max_length=200, null=True)
  is_genuine = models.CharField(max_length=200, null=True)
  confidence_score = models.FloatField(help_text="Confidence score from 0 to 100, in %", null=True)
  ai_analysis = models.TextField(blank=True, null=True)
  reply = models.TextField(blank=True, null=True)
  created_at = models.DateTimeField(auto_now_add=True, null=True)


  def __str__(self):
    return self.name

class DetectionResult(models.Model):
  detection_doc = models.OneToOneField(DetectionDocument, on_delete=models.CASCADE, related_name="detectionRes")
  is_genuine = models.BooleanField()
  confidence_score = models.IntegerField(help_text="Confidence score from 0 to 100, in %", null=True)
  # analysis = models.TextField()

  def __str__(self):
    return f"Result for {self.detection_doc.name}: {'Genuine' if self.is_genuine else 'Deepfake'}"

class DetectionReply(models.Model):
  pass
