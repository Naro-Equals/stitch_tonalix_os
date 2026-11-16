package com.tonalix.tvlauncher

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import androidx.core.content.ContextCompat
import kotlin.math.sin

/**
 * High-performance, lightweight audio visualizer view designed for TV launchers.
 * Uses a single hardware-accelerated draw pass with 4 smooth sine-modulated bars.
 * Zero CPU overhead when stopped/idle.
 */
class AudioVisualizerView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val barCount = 4
    private val barRect = RectF()
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.accent_color)
        style = Paint.Style.FILL
    }

    private var phase = 0.0
    private var isPlaying = false
    private var animator: ValueAnimator? = null

    // Idle normalized heights for each bar (0.0 to 1.0)
    private val barHeights = floatArrayOf(0.2f, 0.2f, 0.2f, 0.2f)

    init {
        // Ensure hardware layer optimization
        setLayerType(LAYER_TYPE_HARDWARE, null)
    }

    fun start() {
        if (isPlaying) return
        isPlaying = true
        animator?.cancel()
        animator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 1000L
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener {
                phase += 0.18
                barHeights[0] = (0.35f + 0.35f * sin(phase)).toFloat().coerceIn(0.15f, 0.95f)
                barHeights[1] = (0.50f + 0.45f * sin(phase + 1.2)).toFloat().coerceIn(0.15f, 0.95f)
                barHeights[2] = (0.45f + 0.40f * sin(phase + 2.4)).toFloat().coerceIn(0.15f, 0.95f)
                barHeights[3] = (0.40f + 0.35f * sin(phase + 3.6)).toFloat().coerceIn(0.15f, 0.95f)
                invalidate()
            }
            start()
        }
    }

    fun stop() {
        if (!isPlaying) return
        isPlaying = false
        animator?.cancel()
        animator = null
        // Smoothly settle bars to minimum resting height
        for (i in barHeights.indices) {
            barHeights[i] = 0.15f
        }
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return

        val totalSpacing = w * 0.35f
        val spacing = totalSpacing / (barCount + 1)
        val barWidth = (w - totalSpacing) / barCount
        val radius = barWidth / 2f

        for (i in 0 until barCount) {
            val left = spacing + i * (barWidth + spacing)
            val right = left + barWidth
            val barH = h * barHeights[i]
            val top = h - barH
            val bottom = h

            barRect.set(left, top, right, bottom)
            canvas.drawRoundRect(barRect, radius, radius, paint)
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stop()
    }
}
