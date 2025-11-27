// 이슈 1건 타입
export type Issue = {
    id: number // 또는 issueId
    issueId: number // 또는 issueId
    name: string
    projectId: number
    projectName: string
    issueType: string
    issuePriority: '1' | '2' | '3'
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
    {value: 1, label: '상'},
    {value: 2, label: '중'},
    {value: 3, label: '하'},
]

export const getPriorityLabel = (value: number) => {
    const found = priorityOptions.find((p) => p.value === value)
    return found?.label ?? value
}
