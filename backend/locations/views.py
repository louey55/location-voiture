from rest_framework import generics, permissions, status, filters, viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import AnnonceLocation, Reservation, Vehicule
from .serializers import AnnonceLocationSerializer, ReservationSerializer, VehiculeSerializer
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
User = get_user_model()

class PublicAnnonceList(generics.ListAPIView):
    serializer_class = AnnonceLocationSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return AnnonceLocation.objects.filter(
            is_approved=True,
            is_rejected=False
        ).order_by('-created_at').select_related('user')
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
class AdminAnnonceList(generics.ListAPIView):
    serializer_class = AnnonceLocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Seul l'admin peut accéder à cette vue
        if not self.request.user.is_superuser:
            raise PermissionDenied("Vous n'avez pas la permission d'accéder à cette ressource")
        
        return AnnonceLocation.objects.filter(
            is_approved=False,
            is_rejected=False
        ).order_by('-created_at').select_related('user')

class AdminApproveAnnonce(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if not request.user.is_superuser:
            return Response(
                {"detail": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            annonce = AnnonceLocation.objects.get(pk=pk)
        except AnnonceLocation.DoesNotExist:
            return Response(
                {"detail": "Annonce non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        annonce.is_approved = True
        annonce.save()
        
        return Response(
            {"detail": "Annonce approuvée avec succès"},
            status=status.HTTP_200_OK
        )

class AdminRejectAnnonce(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if not request.user.is_superuser:
            return Response(
                {"detail": "Permission refusée"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            annonce = AnnonceLocation.objects.get(pk=pk)
        except AnnonceLocation.DoesNotExist:
            return Response(
                {"detail": "Annonce non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        annonce.is_rejected = True
        annonce.save()
        
        return Response(
            {"detail": "Annonce rejetée avec succès"},
            status=status.HTTP_200_OK
        )        
class AgencyReservationsList(generics.ListAPIView):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != 'Agence':
            raise PermissionDenied("Seules les agences peuvent accéder à cette ressource")
        
        return Reservation.objects.filter(
            vehicle__user=self.request.user
        ).select_related('vehicle', 'client').order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
class ConfirmReservation(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response(
                {"detail": "Réservation non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que l'utilisateur est bien le propriétaire du véhicule
        if reservation.vehicle.user != request.user:
            return Response(
                {"detail": "Vous n'avez pas la permission de confirmer cette réservation"},
                status=status.HTTP_403_FORBIDDEN
            )

        reservation.is_confirmed = True
        reservation.save()

        return Response(
            {"detail": "Réservation confirmée avec succès"},
            status=status.HTTP_200_OK
        )
class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'marque', 'modele']

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [AllowAny]