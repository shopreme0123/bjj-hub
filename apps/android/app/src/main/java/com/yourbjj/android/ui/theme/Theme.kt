package com.yourbjj.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.compositionLocalOf
import com.yourbjj.android.domain.model.BeltColor

private val LocalBeltTheme = compositionLocalOf<BeltTheme> {
    BeltTheme.fromBeltColor(BeltColor.BLUE)
}

@Composable
fun YourBJJTheme(
    beltColor: BeltColor = BeltColor.BLUE,
    content: @Composable () -> Unit
) {
    val beltTheme = BeltTheme.fromBeltColor(beltColor)

    val colorScheme = lightColorScheme(
        primary = beltTheme.primary,
        onPrimary = beltTheme.card,
        primaryContainer = beltTheme.bgGradient,
        onPrimaryContainer = beltTheme.text,
        secondary = beltTheme.primaryLight,
        onSecondary = beltTheme.card,
        background = beltTheme.bg,
        onBackground = beltTheme.text,
        surface = beltTheme.card,
        onSurface = beltTheme.text,
        surfaceVariant = beltTheme.bgGradient,
        onSurfaceVariant = beltTheme.textMuted,
        outline = beltTheme.cardBorder
    )

    CompositionLocalProvider(LocalBeltTheme provides beltTheme) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}

val MaterialTheme.beltTheme: BeltTheme
    @Composable
    get() = LocalBeltTheme.current
