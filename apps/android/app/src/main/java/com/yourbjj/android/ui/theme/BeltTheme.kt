package com.yourbjj.android.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.yourbjj.android.domain.model.BeltColor

data class BeltTheme(
    val belt: BeltColor,
    val primary: Color,
    val primaryLight: Color,
    val gradientStart: Color,
    val gradientEnd: Color,
    val bg: Color,
    val bgGradient: Color,
    val card: Color,
    val cardBorder: Color,
    val text: Color,
    val textMuted: Color,
    val beltMain: Color,
    val beltLight: Color,
    val beltDark: Color,
    val beltStripe: Color,
    val beltShadow: Float
) {
    val backgroundGradient: Brush
        get() = Brush.verticalGradient(
            colors = listOf(bg, bgGradient)
        )

    val gradient: Brush
        get() = Brush.linearGradient(
            colors = listOf(gradientStart, gradientEnd)
        )

    val meshGradient: Brush
        get() = Brush.linearGradient(
            colors = listOf(
                gradientStart.copy(alpha = 0.8f),
                gradientEnd.copy(alpha = 0.6f),
                primary.copy(alpha = 0.4f)
            )
        )

    val beltGradient: Brush
        get() = Brush.verticalGradient(
            colors = listOf(beltLight, beltMain, beltDark)
        )

    val accentGlow: Color
        get() = primary.copy(alpha = 0.12f)

    val subtleTexture: Color
        get() = Color.White.copy(alpha = 0.03f)

    companion object {
        fun fromBeltColor(beltColor: BeltColor): BeltTheme {
            return when (beltColor) {
                BeltColor.WHITE -> BeltTheme(
                    belt = BeltColor.WHITE,
                    primary = Color(0xFF475569),
                    primaryLight = Color(0xFF64748b),
                    gradientStart = Color(0xFF64748b),
                    gradientEnd = Color(0xFF94a3b8),
                    bg = Color(0xFFf8fafc),
                    bgGradient = Color(0xFFf1f5f9),
                    card = Color(0xFFffffff),
                    cardBorder = Color(0xFFe2e8f0),
                    text = Color(0xFF0f172a),
                    textMuted = Color(0xFF64748b),
                    beltMain = Color(0xFFe2e8f0),
                    beltLight = Color(0xFFf8fafc),
                    beltDark = Color(0xFFcbd5e1),
                    beltStripe = Color(0xFF0f172a),
                    beltShadow = 0.20f
                )
                BeltColor.BLUE -> BeltTheme(
                    belt = BeltColor.BLUE,
                    primary = Color(0xFF2563eb),
                    primaryLight = Color(0xFF3b82f6),
                    gradientStart = Color(0xFF3b82f6),
                    gradientEnd = Color(0xFF60a5fa),
                    bg = Color(0xFFf8fafc),
                    bgGradient = Color(0xFFeff6ff),
                    card = Color(0xFFffffff),
                    cardBorder = Color(0xFFdbeafe),
                    text = Color(0xFF0f172a),
                    textMuted = Color(0xFF64748b),
                    beltMain = Color(0xFF2563eb),
                    beltLight = Color(0xFF3b82f6),
                    beltDark = Color(0xFF1d4ed8),
                    beltStripe = Color(0xFF0f172a),
                    beltShadow = 0.32f
                )
                BeltColor.PURPLE -> BeltTheme(
                    belt = BeltColor.PURPLE,
                    primary = Color(0xFF7c3aed),
                    primaryLight = Color(0xFF8b5cf6),
                    gradientStart = Color(0xFF8b5cf6),
                    gradientEnd = Color(0xFFa78bfa),
                    bg = Color(0xFFf8fafc),
                    bgGradient = Color(0xFFfaf5ff),
                    card = Color(0xFFffffff),
                    cardBorder = Color(0xFFe9d5ff),
                    text = Color(0xFF0f172a),
                    textMuted = Color(0xFF64748b),
                    beltMain = Color(0xFF7c3aed),
                    beltLight = Color(0xFF8b5cf6),
                    beltDark = Color(0xFF6d28d9),
                    beltStripe = Color(0xFF0f172a),
                    beltShadow = 0.32f
                )
                BeltColor.BROWN -> BeltTheme(
                    belt = BeltColor.BROWN,
                    primary = Color(0xFF92400e),
                    primaryLight = Color(0xFFb45309),
                    gradientStart = Color(0xFFb45309),
                    gradientEnd = Color(0xFFd97706),
                    bg = Color(0xFFf8fafc),
                    bgGradient = Color(0xFFfffbeb),
                    card = Color(0xFFffffff),
                    cardBorder = Color(0xFFfed7aa),
                    text = Color(0xFF0f172a),
                    textMuted = Color(0xFF64748b),
                    beltMain = Color(0xFF92400e),
                    beltLight = Color(0xFFb45309),
                    beltDark = Color(0xFF78350f),
                    beltStripe = Color(0xFF0f172a),
                    beltShadow = 0.32f
                )
                BeltColor.BLACK -> BeltTheme(
                    belt = BeltColor.BLACK,
                    primary = Color(0xFF09090b),
                    primaryLight = Color(0xFF18181b),
                    gradientStart = Color(0xFF18181b),
                    gradientEnd = Color(0xFF3f3f46),
                    bg = Color(0xFFfafafa),
                    bgGradient = Color(0xFFf4f4f5),
                    card = Color(0xFFffffff),
                    cardBorder = Color(0xFFe4e4e7),
                    text = Color(0xFF09090b),
                    textMuted = Color(0xFF71717a),
                    beltMain = Color(0xFF18181b),
                    beltLight = Color(0xFF27272a),
                    beltDark = Color(0xFF09090b),
                    beltStripe = Color(0xFFfafafa),
                    beltShadow = 0.45f
                )
            }
        }
    }
}
