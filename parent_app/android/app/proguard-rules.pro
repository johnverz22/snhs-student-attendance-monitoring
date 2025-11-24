# Pushy SDK ProGuard Rules
# Keep Pushy classes
-keep class me.pushy.sdk.** { *; }
-dontwarn me.pushy.sdk.**

# Keep Google Play Services classes that Pushy references (optional)
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**

# Keep classes referenced by Pushy but not required
-keep class com.google.android.gms.tasks.** { *; }
-keep class com.google.firebase.messaging.** { *; }

# If the above classes are missing, ignore the warnings
-dontnote com.google.android.gms.**
-dontnote com.google.firebase.**
