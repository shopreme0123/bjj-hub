package com.yourbjj.android.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class TechniqueCategory(
    val id: String,
    val icon: String
) {
    companion object {
        val defaultCategories = listOf(
            TechniqueCategory("guard", "🛡️"),
            TechniqueCategory("top", "⬆️"),
            TechniqueCategory("stand", "🧍"),
            TechniqueCategory("leglock", "🦵"),
            TechniqueCategory("turtle", "🐢"),
            TechniqueCategory("back", "🔙")
        )
    }
}
