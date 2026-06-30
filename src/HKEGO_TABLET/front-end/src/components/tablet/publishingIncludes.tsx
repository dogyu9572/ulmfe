import { renderToStaticMarkup } from 'react-dom/server'
import { AttendanceHeader } from './AttendanceHeader'
import { StudentCaseHeader } from './StudentCaseHeader'
import { StudentMissionHeader } from './StudentMissionHeader'
import { TeacherHeader } from './TeacherHeader'

const includeComponents = {
	'/pub/inc/header_attendance.html': <AttendanceHeader />,
	'/pub/inc/header_student_case.html': <StudentCaseHeader />,
	'/pub/inc/header_student_mission.html': <StudentMissionHeader />,
	'/pub/inc/header_teacher.html': <TeacherHeader />
} as const

export const renderPublishingInclude = (includePath: string) => {
	const component = includeComponents[includePath as keyof typeof includeComponents]
	return component ? renderToStaticMarkup(component) : null
}
