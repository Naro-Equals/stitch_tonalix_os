package com.tonalix.tvlauncher

/**
 * Perfil de sesión blindada (mismo modelo conceptual que el prototipo web brisa-tv).
 */
data class UserProfile(
    val id: String,
    val name: String,
    val roleLabel: String,
    val avatarColor: String,
    val avatarIcon: String,
    val pinHash: String,
    val pinSalt: String,
    val lockOnHome: Boolean,
    val hasPin: Boolean
) {
    companion object {
        val AVATAR_ICONS = listOf(
            "user", "home", "star", "game", "music", "film", "shield", "heart"
        )

        val AVATAR_COLORS = listOf(
            "#22D3EE", "#A78BFA", "#34D399", "#F472B6",
            "#FBBF24", "#60A5FA", "#FB7185", "#A3E635"
        )
    }
}
