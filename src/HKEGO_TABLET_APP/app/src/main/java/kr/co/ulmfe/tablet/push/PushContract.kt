package kr.co.ulmfe.tablet.push

object PushContract {
    const val TABLET_ORIGIN = "https://ulmfe-tablet.hk-test.co.kr"
    const val DEVICE_API_PATH = "/api/tablet/push/devices"
    const val JS_INTERFACE_NAME = "AndroidPush"

    const val TYPE_TEACHER_CALL = "TEACHER_CALL"
    const val TYPE_TEACHER_MESSAGE = "TEACHER_MESSAGE"
    const val ROLE_TEACHER = "TEACHER"
    const val ROLE_STUDENT = "STUDENT"

    const val TEACHER_CALL_PATH = "/teacher/call_history"

    const val EXTRA_TYPE = "push_type"
    const val EXTRA_PATH = "push_path"
    const val EXTRA_EVENT_SN = "push_event_sn"

    const val CHANNEL_TEACHER_CALL = "teacher_call"
    const val CHANNEL_TEACHER_MESSAGE = "teacher_message"
}
