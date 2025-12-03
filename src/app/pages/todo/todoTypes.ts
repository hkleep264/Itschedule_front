export interface TodoItem {
    issueId: number
    name: string          // 이슈 제목
    projectName?: string   // 프로젝트명 (있으면 표시)
    startDate?: string     // 시작일
    endDate?: string       // 기한
    isToday: 0 | 1         // 오늘 할 일 여부
    isImportant: 0 | 1     // 중요 여부(별)
    isDone: 0 | 1          // 완료 여부(체크박스용, 있으면 사용)
}
