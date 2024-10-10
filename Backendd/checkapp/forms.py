# from django import forms
# from django.contrib.auth.forms import AuthenticationForm
# from django.contrib.auth.models import User

# class RoleLoginForm(AuthenticationForm):
#     ROLE_CHOICES = [
#         ('reviewee', 'Reviewee'),
#         ('reviewer', 'Reviewer'),
#         ('admin', 'Admin'),
#     ]

#     role = forms.ChoiceField(choices=ROLE_CHOICES, label='Login as', required=True)

#     def clean(self):
#         cleaned_data = super().clean()

#         # Get the authenticated user
#         user = self.get_user()

#         if user:
#             # Retrieve the selected role from the cleaned data
#             selected_role = self.cleaned_data.get('role')

#             # If the selected role is not in the user's rolenames
#             if selected_role not in user.rolenames:
#                 # Optionally, you can raise a warning or just pass
#                 self.add_error('role', "Selected role is not present in your assigned roles.")

#         return cleaned_data
