from rest_framework import generics, permissions, status, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AnnonceLocation, Reservation
from .serializers import AnnonceLocationSerializer, ReservationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class PublicAnnonceList(generics.ListAPIView):
    serializer_class = AnnonceLocationSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return AnnonceLocation.objects.all().order_by('-created_at').select_related('user')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AnnonceLocationListCreate(generics.ListCreateAPIView):
    serializer_class = AnnonceLocationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['marque', 'modele', 'matricule', 'zone']
    ordering_fields = ['prix', 'created_at']

    def get_queryset(self):
        queryset = AnnonceLocation.objects.all().order_by('-created_at')
        if self.request.user.user_type == 'Agence':
            return queryset.filter(user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'Agence':
            return Response(
                {"detail": "Seules les agences peuvent publier des annonces"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

class AnnonceLocationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnnonceLocation.objects.all()
    serializer_class = AnnonceLocationSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE'] and obj.user != request.user:
            self.permission_denied(
                request,
                message="Vous n'avez pas la permission de modifier cette annonce",
                code=status.HTTP_403_FORBIDDEN
            )

    def perform_update(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"detail": "Annonce supprimée avec succès"},
            status=status.HTTP_204_NO_CONTENT
        )
class ReservationListCreate(generics.ListCreateAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reservation.objects.filter(client=self.request.user).select_related('vehicle')

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

class ReservationDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reservation.objects.all()

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if obj.client != request.user:
            self.permission_denied(
                request,
                message="Vous n'avez pas accès à cette réservation",
                code=status.HTTP_403_FORBIDDEN
            )