package com.tonalix.tvlauncher

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

/**
 * Almacén de perfiles estilo prototipo web (localStorage tonalix_tv_users_v3).
 */
class UserProfileStore(context: Context) {

    private val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS = "tonalix_user_profiles_v1"
        private const val KEY_USERS = "users_json"
        private const val KEY_ACTIVE = "active_user_id"
        private const val KEY_UNLOCKED = "session_unlocked_user_id"
        private const val KEY_SESSION_TOKEN = "session_token"
    }

    fun getUsers(): List<UserProfile> {
        val raw = prefs.getString(KEY_USERS, null)
        if (raw.isNullOrBlank()) {
            val defaults = defaultUsers()
            saveUsers(defaults)
            return defaults
        }
        return try {
            parseUsers(raw)
        } catch (_: Exception) {
            val defaults = defaultUsers()
            saveUsers(defaults)
            defaults
        }
    }

    fun saveUsers(users: List<UserProfile>) {
        val arr = JSONArray()
        users.forEach { u ->
            arr.put(
                JSONObject()
                    .put("id", u.id)
                    .put("name", u.name)
                    .put("roleLabel", u.roleLabel)
                    .put("avatarColor", u.avatarColor)
                    .put("avatarIcon", u.avatarIcon)
                    .put("pinHash", u.pinHash)
                    .put("pinSalt", u.pinSalt)
                    .put("lockOnHome", u.lockOnHome)
                    .put("hasPin", u.hasPin)
            )
        }
        prefs.edit().putString(KEY_USERS, arr.toString()).apply()
    }

    fun getActiveUser(): UserProfile {
        val users = getUsers()
        val activeId = prefs.getString(KEY_ACTIVE, null)
        return users.firstOrNull { it.id == activeId } ?: users.first()
    }

    fun setActiveUserId(id: String) {
        prefs.edit().putString(KEY_ACTIVE, id).apply()
    }

    fun isSessionUnlocked(): Boolean {
        val unlocked = prefs.getString(KEY_UNLOCKED, null) ?: return false
        val active = getActiveUser()
        if (unlocked != active.id) return false
        if (!active.hasPin) return true
        val token = prefs.getString(KEY_SESSION_TOKEN, null)
        return !token.isNullOrBlank()
    }

    fun unlockSession(userId: String) {
        prefs.edit()
            .putString(KEY_ACTIVE, userId)
            .putString(KEY_UNLOCKED, userId)
            .putString(KEY_SESSION_TOKEN, UUID.randomUUID().toString())
            .apply()
    }

    fun lockSession() {
        prefs.edit()
            .remove(KEY_UNLOCKED)
            .remove(KEY_SESSION_TOKEN)
            .apply()
    }

    fun updateUser(updated: UserProfile) {
        val next = getUsers().map { if (it.id == updated.id) updated else it }
        saveUsers(next)
    }

    fun createUser(
        name: String,
        pin: String,
        avatarColor: String = UserProfile.AVATAR_COLORS.random(),
        avatarIcon: String = UserProfile.AVATAR_ICONS.random()
    ): UserProfile {
        val salt = if (pin.isNotBlank()) PinHasher.newSalt() else ""
        val hash = if (pin.isNotBlank()) PinHasher.hashPin(pin, salt) else ""
        val user = UserProfile(
            id = "user-${UUID.randomUUID()}",
            name = name.ifBlank { "Nuevo perfil" },
            roleLabel = "Perfil aislado · Sesión blindada",
            avatarColor = avatarColor,
            avatarIcon = avatarIcon,
            pinHash = hash,
            pinSalt = salt,
            lockOnHome = true,
            hasPin = pin.isNotBlank()
        )
        saveUsers(getUsers() + user)
        return user
    }

    fun setPin(userId: String, pin: String) {
        val users = getUsers()
        val next = users.map { u ->
            if (u.id != userId) u
            else if (pin.isBlank()) u.copy(pinHash = "", pinSalt = "", hasPin = false)
            else {
                val salt = PinHasher.newSalt()
                u.copy(
                    pinHash = PinHasher.hashPin(pin, salt),
                    pinSalt = salt,
                    hasPin = true
                )
            }
        }
        saveUsers(next)
    }

    fun verifyPin(user: UserProfile, pin: String): Boolean {
        if (!user.hasPin) return true
        return PinHasher.verify(pin, user.pinSalt, user.pinHash)
    }

    /** Exporta metadatos de perfil (sin hashes) + snapshot de prefs del launcher. */
    fun exportActiveProfileBundle(configManager: LauncherConfigManager): JSONObject {
        val user = getActiveUser()
        return JSONObject()
            .put("v", 1)
            .put("type", "tonalix_profile_sync")
            .put(
                "profile",
                JSONObject()
                    .put("name", user.name)
                    .put("roleLabel", user.roleLabel)
                    .put("avatarColor", user.avatarColor)
                    .put("avatarIcon", user.avatarIcon)
                    .put("lockOnHome", user.lockOnHome)
            )
            .put("settings", configManager.toSyncJson())
    }

    fun importProfileBundle(bundle: JSONObject, configManager: LauncherConfigManager): UserProfile {
        val profileObj = bundle.optJSONObject("profile") ?: JSONObject()
        val name = profileObj.optString("name", "Perfil importado")
        val color = profileObj.optString("avatarColor", UserProfile.AVATAR_COLORS[0])
        val icon = profileObj.optString("avatarIcon", "user")
        val role = profileObj.optString("roleLabel", "Importado por QR · Sesión blindada")
        val lock = profileObj.optBoolean("lockOnHome", true)

        val imported = createUser(name = name, pin = "", avatarColor = color, avatarIcon = icon)
            .copy(roleLabel = role, lockOnHome = lock)
        updateUser(imported)
        setActiveUserId(imported.id)

        val settings = bundle.optJSONObject("settings")
        if (settings != null) {
            configManager.applySyncJson(settings)
        }
        return imported
    }

    private fun parseUsers(raw: String): List<UserProfile> {
        val arr = JSONArray(raw)
        val list = mutableListOf<UserProfile>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            list.add(
                UserProfile(
                    id = o.getString("id"),
                    name = o.optString("name", "Usuario"),
                    roleLabel = o.optString("roleLabel", "Sesión blindada"),
                    avatarColor = o.optString("avatarColor", "#22D3EE"),
                    avatarIcon = o.optString("avatarIcon", "user"),
                    pinHash = o.optString("pinHash", ""),
                    pinSalt = o.optString("pinSalt", ""),
                    lockOnHome = o.optBoolean("lockOnHome", true),
                    hasPin = o.optBoolean("hasPin", o.optString("pinHash").isNotBlank())
                )
            )
        }
        return list.ifEmpty { defaultUsers() }
    }

    private fun defaultUsers(): List<UserProfile> {
        val salt1 = PinHasher.newSalt()
        val salt2 = PinHasher.newSalt()
        return listOf(
            UserProfile(
                id = "user-primary",
                name = "Inicio Principal",
                roleLabel = "Administrador · Sesión blindada",
                avatarColor = "#22D3EE",
                avatarIcon = "home",
                pinHash = PinHasher.hashPin("1234", salt1),
                pinSalt = salt1,
                lockOnHome = true,
                hasPin = true
            ),
            UserProfile(
                id = "user-secondary",
                name = "Sesión Privada / Sala",
                roleLabel = "Perfil aislado · Fire TV",
                avatarColor = "#A78BFA",
                avatarIcon = "shield",
                pinHash = PinHasher.hashPin("5678", salt2),
                pinSalt = salt2,
                lockOnHome = true,
                hasPin = true
            )
        )
    }
}
