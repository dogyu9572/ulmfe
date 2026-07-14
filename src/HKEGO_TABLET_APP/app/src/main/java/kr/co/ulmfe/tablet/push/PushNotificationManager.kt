package kr.co.ulmfe.tablet.push

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import kr.co.ulmfe.tablet.MainActivity
import kr.co.ulmfe.tablet.R
import java.util.concurrent.atomic.AtomicInteger

object PushNotificationManager {
    private val notificationSequence = AtomicInteger(
        (System.currentTimeMillis() % 1_000_000L).toInt()
    )
    private val vibrationPattern = longArrayOf(0L, 250L, 150L, 250L)

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val notificationManager = context.getSystemService(NotificationManager::class.java)
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .build()

        val callChannel = NotificationChannel(
            PushContract.CHANNEL_TEACHER_CALL,
            context.getString(R.string.teacher_call_channel_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.teacher_call_channel_description)
            enableVibration(true)
            vibrationPattern = PushNotificationManager.vibrationPattern
            setSound(soundUri, audioAttributes)
        }
        val messageChannel = NotificationChannel(
            PushContract.CHANNEL_TEACHER_MESSAGE,
            context.getString(R.string.teacher_message_channel_name),
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = context.getString(R.string.teacher_message_channel_description)
            enableVibration(true)
            vibrationPattern = PushNotificationManager.vibrationPattern
            setSound(soundUri, audioAttributes)
        }

        notificationManager.createNotificationChannels(listOf(callChannel, messageChannel))
    }

    fun showNotification(
        context: Context,
        type: String,
        title: String,
        body: String,
        path: String,
        eventSn: String
    ) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        createChannels(context)
        val notificationId = nextNotificationId()
        val channelId = if (type == PushContract.TYPE_TEACHER_CALL) {
            PushContract.CHANNEL_TEACHER_CALL
        } else {
            PushContract.CHANNEL_TEACHER_MESSAGE
        }
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(PushContract.EXTRA_TYPE, type)
            putExtra(PushContract.EXTRA_PATH, path)
            putExtra(PushContract.EXTRA_EVENT_SN, eventSn)
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setSound(soundUri)
            .setVibrate(vibrationPattern)
            .build()

        NotificationManagerCompat.from(context).notify(notificationId, notification)
    }

    private fun nextNotificationId(): Int = notificationSequence.updateAndGet { current ->
        if (current == Int.MAX_VALUE) 1 else current + 1
    }
}
