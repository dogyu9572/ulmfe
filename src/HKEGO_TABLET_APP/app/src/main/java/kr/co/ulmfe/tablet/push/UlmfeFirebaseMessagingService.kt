package kr.co.ulmfe.tablet.push

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class UlmfeFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        PushRegistrationManager.updateToken(applicationContext, token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)

        val data = message.data
        val type = data["type"].orEmpty()
        if (type != PushContract.TYPE_TEACHER_CALL &&
            type != PushContract.TYPE_TEACHER_MESSAGE
        ) {
            Log.w(TAG, "Ignored unsupported push type")
            return
        }

        val defaultTitle = if (type == PushContract.TYPE_TEACHER_CALL) {
            "선생님 호출"
        } else {
            "선생님 메시지"
        }
        val title = data["title"] ?: message.notification?.title ?: defaultTitle
        val body = data["body"] ?: message.notification?.body.orEmpty()
        val path = data["path"].orEmpty()
        val eventSn = if (type == PushContract.TYPE_TEACHER_CALL) {
            data["callSn"].orEmpty()
        } else {
            data["msgSn"].orEmpty()
        }

        PushNotificationManager.showNotification(
            context = applicationContext,
            type = type,
            title = title,
            body = body,
            path = path,
            eventSn = eventSn
        )
    }

    override fun onDeletedMessages() {
        super.onDeletedMessages()
        Log.w(TAG, "FCM deleted pending messages; the existing polling remains the fallback")
    }

    private companion object {
        const val TAG = "UlmfeFcmService"
    }
}
