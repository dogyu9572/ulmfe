package kr.co.ulmfe.tablet.push

import android.content.Context
import android.util.Log
import android.webkit.CookieManager
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLDecoder
import java.util.Locale
import java.util.UUID
import java.util.concurrent.Executors

object PushRegistrationManager {
    private const val TAG = "PushRegistration"
    private const val PREFS_NAME = "push_registration"
    private const val KEY_DEVICE_ID = "device_id"
    private const val KEY_FCM_TOKEN = "fcm_token"
    private const val KEY_ROLE = "role"
    private const val KEY_RSVT_SN = "rsvt_sn"
    private const val KEY_STUDENT_SNS = "student_sns"
    private const val KEY_ACTIVE = "active"

    private val executor = Executors.newSingleThreadExecutor()

    fun getDeviceId(context: Context): String {
        val preferences = preferences(context)
        val existing = preferences.getString(KEY_DEVICE_ID, null)
        if (!existing.isNullOrBlank()) {
            return existing
        }

        return synchronized(this) {
            preferences.getString(KEY_DEVICE_ID, null)?.takeIf { it.isNotBlank() }
                ?: UUID.randomUUID().toString().also { generated ->
                    preferences.edit().putString(KEY_DEVICE_ID, generated).apply()
                }
        }
    }

    fun registerContext(context: Context, contextJson: String) {
        val parsed = try {
            parseContext(contextJson)
        } catch (exception: JSONException) {
            Log.w(TAG, "Rejected invalid push context", exception)
            return
        }

        preferences(context).edit()
            .putString(KEY_ROLE, parsed.role)
            .putLong(KEY_RSVT_SN, parsed.rsvtSn)
            .putString(KEY_STUDENT_SNS, parsed.studentSns.toString())
            .putBoolean(KEY_ACTIVE, true)
            .apply()

        if (FirebaseApp.getApps(context).isNotEmpty()) {
            FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
                updateToken(context, token)
            }
        } else {
            syncWithServer(context)
        }
    }

    fun updateToken(context: Context, token: String) {
        if (token.isBlank()) {
            return
        }

        preferences(context).edit().putString(KEY_FCM_TOKEN, token).apply()
        syncWithServer(context)
    }

    fun unregisterContext(context: Context) {
        preferences(context).edit().putBoolean(KEY_ACTIVE, false).apply()
        syncWithServer(context)
    }

    private fun parseContext(contextJson: String): DeviceContext {
        val json = JSONObject(contextJson)
        val role = json.optString("role").uppercase(Locale.US)
        if (role != PushContract.ROLE_TEACHER && role != PushContract.ROLE_STUDENT) {
            throw JSONException("role must be TEACHER or STUDENT")
        }

        val rsvtSn = json.optLong("rsvtSn", -1L)
        if (rsvtSn <= 0L) {
            throw JSONException("rsvtSn must be a positive number")
        }

        val sourceStudentSns = json.optJSONArray("studentSns") ?: JSONArray()
        val normalizedStudentSns = JSONArray()
        for (index in 0 until sourceStudentSns.length()) {
            val studentSn = sourceStudentSns.optLong(index, -1L)
            if (studentSn > 0L) {
                normalizedStudentSns.put(studentSn)
            }
        }

        return DeviceContext(role, rsvtSn, normalizedStudentSns)
    }

    private fun syncWithServer(context: Context) {
        val payload = buildPayload(context) ?: return
        executor.execute {
            putDeviceRegistration(payload)
        }
    }

    private fun buildPayload(context: Context): JSONObject? {
        val preferences = preferences(context)
        val active = preferences.getBoolean(KEY_ACTIVE, false)
        val token = preferences.getString(KEY_FCM_TOKEN, null).orEmpty()
        val role = preferences.getString(KEY_ROLE, null).orEmpty()
        val rsvtSn = preferences.getLong(KEY_RSVT_SN, -1L)

        if (active && (token.isBlank() || role.isBlank() || rsvtSn <= 0L)) {
            return null
        }

        return JSONObject()
            .put("deviceId", getDeviceId(context))
            .put("fcmToken", token)
            .put("role", role.ifBlank { JSONObject.NULL })
            .put("rsvtSn", if (rsvtSn > 0L) rsvtSn else JSONObject.NULL)
            .put(
                "studentSns",
                JSONArray(preferences.getString(KEY_STUDENT_SNS, "[]"))
            )
            .put("active", active)
            .put("clientUpdatedAtEpochMs", System.currentTimeMillis())
    }

    private fun putDeviceRegistration(payload: JSONObject) {
        val deviceId = payload.getString("deviceId")
        val connection = URL(
            "${PushContract.TABLET_ORIGIN}${PushContract.DEVICE_API_PATH}/$deviceId"
        ).openConnection() as HttpURLConnection

        try {
            connection.requestMethod = "PUT"
            connection.connectTimeout = 10_000
            connection.readTimeout = 10_000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")
            connection.setRequestProperty("Accept", "application/json")
            CookieManager.getInstance().getCookie(PushContract.TABLET_ORIGIN)
                ?.takeIf { it.isNotBlank() }
                ?.let { cookie ->
                    connection.setRequestProperty("Cookie", cookie)
                    extractCookieValue(cookie, XSRF_COOKIE_NAME)
                        ?.let { xsrfToken ->
                            connection.setRequestProperty(
                                XSRF_HEADER_NAME,
                                URLDecoder.decode(xsrfToken, Charsets.UTF_8.name())
                            )
                        }
                }

            connection.outputStream.bufferedWriter(Charsets.UTF_8).use { writer ->
                writer.write(payload.toString())
            }

            val responseCode = connection.responseCode
            if (responseCode !in 200..299) {
                Log.w(TAG, "Device registration API returned HTTP $responseCode")
            }
        } catch (exception: Exception) {
            Log.w(TAG, "Device registration API is not available", exception)
        } finally {
            connection.disconnect()
        }
    }

    private fun preferences(context: Context) =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private fun extractCookieValue(cookieHeader: String, cookieName: String): String? =
        cookieHeader.split(';')
            .asSequence()
            .map { it.trim() }
            .firstOrNull { cookie -> cookie.substringBefore('=') == cookieName }
            ?.substringAfter('=', missingDelimiterValue = "")
            ?.takeIf { it.isNotBlank() }

    private data class DeviceContext(
        val role: String,
        val rsvtSn: Long,
        val studentSns: JSONArray
    )

    private const val XSRF_COOKIE_NAME = "XSRF-TOKEN"
    private const val XSRF_HEADER_NAME = "X-XSRF-TOKEN"
}
