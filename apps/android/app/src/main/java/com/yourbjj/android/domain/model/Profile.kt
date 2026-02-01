package com.yourbjj.android.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Profile(
    val id: String,
    @SerialName("display_name")
    val displayName: String? = null,
    @SerialName("avatar_url")
    val avatarUrl: String? = null,
    @SerialName("belt_color")
    val beltColor: String? = null,
    @SerialName("belt_stripes")
    val beltStripes: Int? = null,
    @SerialName("bjj_start_date")
    val bjjStartDate: String? = null,
    val bio: String? = null,
    @SerialName("is_premium")
    val isPremium: Boolean? = null,
    @SerialName("premium_until")
    val premiumUntil: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null,
    @SerialName("updated_at")
    val updatedAt: String? = null
)
