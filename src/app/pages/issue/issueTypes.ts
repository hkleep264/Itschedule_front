// 이슈 1건 타입
export type Issue = {
    id: number // 또는 issueId
    issueId: number // 또는 issueId
    name: string
    projectId: number
    projectName: string
    issueType: string
    issuePriority: '1' | '2' | '3'
    issueStatus: '0' | '1' | '2'
    managerUserId: string
    managerName: string
    startDate: string
    endDate: string
    content: string
}

export type ProjectItem = {
    projectId: number
    projectName: string
}

export type MemberItem = {
    userId: string
    userName: string
    email: string
}

type ProjectWithMembers = {
    projectId: number
    projectName: string
    members: MemberItem[]
}

export const priorityOptions = [
    {value: '1', label: '상'},
    {value: '2', label: '중'},
    {value: '3', label: '하'},
]

export const getPriorityLabel = (value: string | number) => {
    const strValue = String(value) // 숫자든 문자열이든 '1','2','3'으로 맞추기
    const found = priorityOptions.find((p) => p.value === strValue)
    return found?.label ?? strValue
}

export const issueStatusOptions = [
    {value: '0', label: '준비중'},
    {value: '1', label: '진행중'},
    {value: '2', label: '완료'},
]

export const getIssueStatusLabel = (value: string | number) => {
    const strValue = String(value) // 숫자든 문자열이든 '0','1','2'으로 맞추기
    const found = issueStatusOptions.find((p) => p.value === strValue)
    return found?.label ?? strValue
}
