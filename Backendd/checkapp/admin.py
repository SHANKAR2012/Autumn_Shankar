# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
# from .models import User, Assignment  # Import your custom User model and Assignment model

# # Extend the UserAdmin class to include your custom fields
# class CustomUserAdmin(UserAdmin):
#     fieldsets = UserAdmin.fieldsets + (
#         (None, {'fields': ('branch', 'enrollment_no', 'rolenames')}),
#     )
#     add_fieldsets = UserAdmin.add_fieldsets + (
#         (None, {'fields': ('branch', 'enrollment_no', 'rolenames')}),
#     )

#     # Display these fields in the list view
#     list_display = ['username', 'email', 'branch', 'enrollment_no', 'is_staff', 'rolenames']
#     list_filter = ['is_staff', 'is_active']  # Add filters for staff and active status
#     search_fields = ['username', 'email', 'branch', 'enrollment_no']  # Add search functionality for multiple fields

# # Register the custom User model
# admin.site.register(User, CustomUserAdmin)

# # Register the Assignment model
# @admin.register(Assignment)
# class AssignmentAdmin(admin.ModelAdmin):
#     list_display = ['title', 'creator', 'deadline', 'created_at','reviewees','reviewers']  # Customize the display fields in the list view
#     search_fields = ['title', 'creator__username']  # Add search functionality for title and creator
#     list_filter = ['creator', 'deadline']  # Add filters for creator and deadline
#     ordering = ['deadline']  # Optional: Order assignments by deadline

# # Optional: Customize the representation of the Assignment model in the admin panel
# class AssignmentInline(admin.TabularInline):
#     model = Assignment
#     extra = 1  # How many empty assignment fields to show

# # If you want to show assignments inline on the User admin page
# class CustomUserAdminWithAssignments(CustomUserAdmin):
#     inlines = [AssignmentInline]  # Add inline assignments to user view

# # Re-register the custom User model with inline assignments
# admin.site.unregister(User)  # Unregister the previous UserAdmin
# admin.site.register(User, CustomUserAdminWithAssignments)  # Register the new UserAdmin with inline assignments

