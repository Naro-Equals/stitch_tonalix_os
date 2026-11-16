package com.tonalix.tvlauncher

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent

class SecureAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "SecureAccessibilityService"
        var isServiceRunning = false
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceRunning = true
        Log.i(TAG, "Secure D-Pad Accessibility Service connected.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Accessibility events received for virtual D-Pad cursor positioning if required
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility Service interrupted.")
    }

    override fun onDestroy() {
        isServiceRunning = false
        super.onDestroy()
    }
}