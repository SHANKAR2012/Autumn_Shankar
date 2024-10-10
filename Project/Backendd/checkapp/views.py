# from django.http import HttpResponse
# from django.shortcuts import render


# # Create your views here.
# from django.shortcuts import render, redirect
# from django.contrib.auth import login
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth import authenticate
# from .forms import RoleLoginForm

# def custom_login_view(request):
#     if request.method == 'POST':
#         form = RoleLoginForm(request, data=request.POST)
#         if form.is_valid():
#             user = form.get_user()
#             selected_role = form.cleaned_data.get('role')

#             # Log the user in
#             login(request, user)

#             # Redirect based on the selected role
#             if selected_role == 'reviewer':
#                 return redirect('reviewer_dashboard')
#             elif selected_role == 'reviewee':
#                 return redirect('reviewee_dashboard')
#             else:
#                 return redirect('default_dashboard')  # If no valid role, send to a default page
#     else:
#         form = RoleLoginForm()

#     return render(request, 'custom_login.html', {'form': form})

# @login_required
# def reviewer_dashboard(request):
#     # Here, fetch and display all reviewer-related information
#     return HttpResponse("Hello reviewer")

# @login_required
# def reviewee_dashboard(request):
#     # Here, fetch and display all reviewee-related information
#      return HttpResponse("Hello reviewee")
   

from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Group, Assignment, Submission, Comment, Subtask
from .serializers import (
    UserSerializer,
    GroupSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
    CommentSerializer,
    SubtaskSerializer
)

User = get_user_model()

# User views
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


# Group views
class GroupListCreateView(generics.ListCreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class GroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


# Assignment views
class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]


# Submission views
class SubmissionListCreateView(generics.ListCreateAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]


# Comment views
class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]


# Subtask views
class SubtaskListCreateView(generics.ListCreateAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubtaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer
    permission_classes = [permissions.IsAuthenticated]
