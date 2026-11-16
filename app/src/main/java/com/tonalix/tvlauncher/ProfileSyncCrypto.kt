package com.tonalix.tvlauncher

import android.util.Base64
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

object ProfileSyncCrypto {
    private const val GCM_TAG_BITS = 128

    fun newKeyBase64(): String {
        val key = ByteArray(16)
        SecureRandom().nextBytes(key)
        return Base64.encodeToString(key, Base64.NO_WRAP or Base64.URL_SAFE)
    }

    fun newToken(): String {
        val bytes = ByteArray(12)
        SecureRandom().nextBytes(bytes)
        return Base64.encodeToString(bytes, Base64.NO_WRAP or Base64.URL_SAFE)
            .trimEnd('=')
    }

    fun encrypt(plainUtf8: String, keyBase64Url: String): String {
        val keyBytes = Base64.decode(keyBase64Url, Base64.NO_WRAP or Base64.URL_SAFE)
        val iv = ByteArray(12)
        SecureRandom().nextBytes(iv)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(keyBytes, "AES"), GCMParameterSpec(GCM_TAG_BITS, iv))
        val encrypted = cipher.doFinal(plainUtf8.toByteArray(Charsets.UTF_8))
        val out = ByteArray(iv.size + encrypted.size)
        System.arraycopy(iv, 0, out, 0, iv.size)
        System.arraycopy(encrypted, 0, out, iv.size, encrypted.size)
        return Base64.encodeToString(out, Base64.NO_WRAP or Base64.URL_SAFE)
    }

    fun decrypt(payloadBase64Url: String, keyBase64Url: String): String {
        val all = Base64.decode(payloadBase64Url, Base64.NO_WRAP or Base64.URL_SAFE)
        require(all.size > 12) { "payload too short" }
        val iv = all.copyOfRange(0, 12)
        val cipherBytes = all.copyOfRange(12, all.size)
        val keyBytes = Base64.decode(keyBase64Url, Base64.NO_WRAP or Base64.URL_SAFE)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(keyBytes, "AES"), GCMParameterSpec(GCM_TAG_BITS, iv))
        return String(cipher.doFinal(cipherBytes), Charsets.UTF_8)
    }
}
