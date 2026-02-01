package com.yourbjj.android.domain.model

import kotlinx.serialization.Serializable

@Serializable
enum class BeltColor(val value: String) {
    WHITE("white"),
    BLUE("blue"),
    PURPLE("purple"),
    BROWN("brown"),
    BLACK("black");

    companion object {
        fun fromString(value: String): BeltColor {
            return entries.find { it.value == value } ?: WHITE
        }
    }
}
