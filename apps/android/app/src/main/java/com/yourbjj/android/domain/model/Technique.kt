package com.yourbjj.android.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Technique(
    val id: String,
    @SerialName("user_id")
    val userId: String,
    val name: String,
    @SerialName("name_en")
    val nameEn: String? = null,
    @SerialName("category_id")
    val categoryId: String? = null,
    val category: String? = null,
    @SerialName("technique_type")
    val techniqueType: String? = null,
    val description: String? = null,
    @SerialName("video_url")
    val videoUrl: String? = null,
    @SerialName("video_type")
    val videoType: String? = null,
    val tags: List<String>? = null,
    val difficulty: String? = null,
    @SerialName("mastery_level")
    val masteryLevel: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null,
    @SerialName("updated_at")
    val updatedAt: String? = null
)

enum class MasteryLevel(val value: String) {
    LEARNING("learning"),
    LEARNED("learned"),
    FAVORITE("favorite");

    val label: String
        get() = when (this) {
            LEARNING -> "学習中"
            LEARNED -> "習得"
            FAVORITE -> "得意技"
        }

    companion object {
        fun fromString(value: String): MasteryLevel {
            return entries.find { it.value == value } ?: LEARNING
        }
    }
}
