package com.tonalix.tvlauncher

import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.graphics.toColorInt

/**
 * Pantalla de sesiones blindadas (equivalente a UserLockScreen.tsx del prototipo web).
 */
class UserLockActivity : AppCompatActivity() {

    private lateinit var userStore: UserProfileStore
    private lateinit var layoutUserList: LinearLayout
    private lateinit var tvSelectedUserName: TextView
    private lateinit var tvPinError: TextView
    private lateinit var tvNoPinHint: TextView
    private lateinit var layoutPinPad: View
    private lateinit var btnEnterNoPin: Button
    private lateinit var dots: List<TextView>

    private var selectedUser: UserProfile? = null
    private var pinInput = StringBuilder()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_lock)

        userStore = UserProfileStore(this)
        layoutUserList = findViewById(R.id.layoutUserList)
        tvSelectedUserName = findViewById(R.id.tvSelectedUserName)
        tvPinError = findViewById(R.id.tvPinError)
        tvNoPinHint = findViewById(R.id.tvNoPinHint)
        layoutPinPad = findViewById(R.id.layoutPinPad)
        btnEnterNoPin = findViewById(R.id.btnEnterNoPin)
        dots = listOf(
            findViewById(R.id.dot0),
            findViewById(R.id.dot1),
            findViewById(R.id.dot2),
            findViewById(R.id.dot3)
        )

        bindPinPad()
        renderUsers()

        val users = userStore.getUsers()
        selectedUser = users.firstOrNull { it.id == userStore.getActiveUser().id } ?: users.firstOrNull()
        refreshSelectedUi()

        onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // Consume back press to maintain user selector screen
            }
        })
    }

    private fun bindPinPad() {
        val map = mapOf(
            R.id.btnPin0 to "0", R.id.btnPin1 to "1", R.id.btnPin2 to "2", R.id.btnPin3 to "3",
            R.id.btnPin4 to "4", R.id.btnPin5 to "5", R.id.btnPin6 to "6",
            R.id.btnPin7 to "7", R.id.btnPin8 to "8", R.id.btnPin9 to "9"
        )
        map.forEach { (id, digit) ->
            findViewById<Button>(id).setOnClickListener { appendDigit(digit) }
        }
        findViewById<Button>(R.id.btnPinClear).setOnClickListener {
            pinInput.clear()
            updateDots()
            tvPinError.visibility = View.GONE
        }
        findViewById<Button>(R.id.btnPinBack).setOnClickListener {
            if (pinInput.isNotEmpty()) pinInput.deleteCharAt(pinInput.length - 1)
            updateDots()
        }
        btnEnterNoPin.setOnClickListener { unlockSelected() }
    }

    private fun renderUsers() {
        layoutUserList.removeAllViews()
        val users = userStore.getUsers()
        users.forEach { user ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                isFocusable = true
                isClickable = true
                setPadding(20, 18, 20, 18)
                background = GradientDrawable().apply {
                    cornerRadius = 28f
                    setColor(0x0DFFFFFF)
                    setStroke(2, 0x1AFFFFFF)
                }
                val lp = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                )
                lp.bottomMargin = 10
                layoutParams = lp
            }

            val avatar = TextView(this).apply {
                text = avatarGlyph(user.avatarIcon)
                gravity = Gravity.CENTER
                setTextColor(Color.BLACK)
                textSize = 18f
                background = GradientDrawable().apply {
                    cornerRadius = 20f
                    setColor(user.avatarColor.toColorInt())
                }
                layoutParams = LinearLayout.LayoutParams(56, 56).apply { marginEnd = 14 }
            }

            val texts = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }
            texts.addView(TextView(this).apply {
                text = user.name
                setTextColor(Color.WHITE)
                textSize = 16f
            })
            texts.addView(TextView(this).apply {
                text = user.roleLabel
                setTextColor(0x8CFFFFFF.toInt())
                textSize = 12f
            })

            val lockHint = TextView(this).apply {
                text = if (user.hasPin) "PIN" else "Libre"
                setTextColor(if (user.hasPin) 0xB3FFFFFF.toInt() else 0xFF22C55E.toInt())
                textSize = 12f
            }

            row.addView(avatar)
            row.addView(texts)
            row.addView(lockHint)
            row.setOnClickListener {
                selectedUser = user
                pinInput.clear()
                tvPinError.visibility = View.GONE
                refreshSelectedUi()
                highlightRows()
            }
            row.tag = user.id
            layoutUserList.addView(row)
        }
        highlightRows()
    }

    private fun highlightRows() {
        val selectedId = selectedUser?.id
        for (i in 0 until layoutUserList.childCount) {
            val row = layoutUserList.getChildAt(i) as LinearLayout
            val active = row.tag == selectedId
            val color = selectedUser?.avatarColor?.toColorInt() ?: Color.CYAN
            row.background = GradientDrawable().apply {
                cornerRadius = 28f
                setColor(if (active) 0x1FFFFFFF else 0x0DFFFFFF)
                setStroke(if (active) 3 else 2, if (active) color else 0x1AFFFFFF)
            }
        }
    }

    private fun refreshSelectedUi() {
        val user = selectedUser ?: return
        tvSelectedUserName.text = user.name
        if (user.hasPin) {
            layoutPinPad.visibility = View.VISIBLE
            btnEnterNoPin.visibility = View.GONE
            tvNoPinHint.visibility = View.GONE
            findViewById<View>(R.id.layoutPinDots).visibility = View.VISIBLE
        } else {
            layoutPinPad.visibility = View.GONE
            btnEnterNoPin.visibility = View.VISIBLE
            btnEnterNoPin.text = "Entrar a ${user.name}"
            tvNoPinHint.visibility = View.VISIBLE
            findViewById<View>(R.id.layoutPinDots).visibility = View.GONE
        }
        updateDots()
        highlightRows()
    }

    private fun appendDigit(digit: String) {
        val user = selectedUser ?: return
        if (!user.hasPin) return
        if (pinInput.length >= 4) return
        pinInput.append(digit)
        updateDots()
        tvPinError.visibility = View.GONE
        if (pinInput.length == 4) {
            if (userStore.verifyPin(user, pinInput.toString())) {
                unlockSelected()
            } else {
                tvPinError.text = "PIN incorrecto para este perfil."
                tvPinError.visibility = View.VISIBLE
                pinInput.clear()
                updateDots()
            }
        }
    }

    private fun updateDots() {
        dots.forEachIndexed { index, tv ->
            tv.text = if (pinInput.length > index) "•" else ""
            tv.alpha = if (pinInput.length > index) 1f else 0.35f
        }
    }

    private fun unlockSelected() {
        val user = selectedUser ?: return
        userStore.unlockSession(user.id)
        Toast.makeText(this, "Sesión: ${user.name}", Toast.LENGTH_SHORT).show()
        startActivity(Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        })
        finish()
    }

    private fun avatarGlyph(icon: String): String {
        return when (icon) {
            "home" -> "⌂"
            "star" -> "★"
            "game" -> "▶"
            "music" -> "♪"
            "film" -> "▣"
            "shield" -> "⛨"
            "heart" -> "♥"
            else -> "☺"
        }
    }
}
