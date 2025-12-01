// 상태: 칼럼 3개
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

// 진행률
export type TaskProgress = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export interface Task {
    id: number
    title: string
    status: TaskStatus
    progress: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    priority: '1' | '2' | '3'
    assigneeName?: string
    assigneeId?: number
    memo?: string
    startDate?: string
    endDate?: string
}

export const taskStatusColumns: {id: TaskStatus; title: string}[] = [
    {id: 'TODO',        title: '준비'},
    {id: 'IN_PROGRESS', title: '진행'},
    {id: 'DONE',        title: '완료'},
]

// 우선순위(기존 issue priority랑 맞추면 됨)
export const taskPriorityOptions = [
    {value: '1' as const, label: '상'},
    {value: '2' as const, label: '중'},
    {value: '3' as const, label: '하'},
]

export const getPriorityLabel = (value: string | number) => {
    const str = String(value)
    const found = taskPriorityOptions.find((p) => p.value === str)
    return found?.label ?? str
}

// 진행률 select 용 (issueStatusOptions랑 이름만 다름)
export const taskProgressOptions: {value: TaskProgress; label: string}[] = [
    {value: 'NOT_STARTED', label: '준비중'},
    {value: 'IN_PROGRESS', label: '진행 중'},
    {value: 'COMPLETED',   label: '완료'},
]
