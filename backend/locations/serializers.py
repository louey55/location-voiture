from rest_framework import serializers
from .models import AnnonceLocation, Reservation
from django.core.validators import FileExtensionValidator
from rest_framework.serializers import SerializerMethodField

class AnnonceLocationSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])],
        required=True
    )
    image_url = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()  # Correction ici
    
    class Meta:
        model = AnnonceLocation
        fields = ['id', 'marque', 'modele', 'matricule', 'moteur', 
                 'puissance', 'prix', 'zone', 'image', 'image_url', 
                 'user_email', 'created_at','is_approved', 'is_rejected']  # Ajout de 'user_email' ici
  
        read_only_fields = ['user', 'created_at', 'image_url', 'user_email','is_approved', 'is_rejected']
        
    def validate_image(self, value):
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError("La taille de l'image ne doit pas dépasser 5MB")
        return value
    
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return 'assets/default-car.jpg'
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None
class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'vehicle', 'client', 'date_debut', 'date_fin', 'telephone', 'is_confirmed', 'created_at']
        read_only_fields = ['client', 'is_confirmed', 'created_at']

    def validate(self, data):
        if data['date_debut'] >= data['date_fin']:
            raise serializers.ValidationError("La date de fin doit être postérieure à la date de début.")
        return data    