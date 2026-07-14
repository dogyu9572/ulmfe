plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

if (file("google-services.json").exists()) {
    pluginManager.apply("com.google.gms.google-services")
} else {
    logger.warn("FCM is disabled: place google-services.json in the app module.")
}

android {
    namespace = "kr.co.ulmfe.tablet"
    compileSdk = 36

    defaultConfig {
        applicationId = "kr.co.ulmfe.tablet"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(platform(libs.firebase.bom))
    implementation("com.google.firebase:firebase-messaging")
}
