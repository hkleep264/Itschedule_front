import {FC, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'

const ISSUE_INSERT_API = 'http://localhost:4567/schedule/issue/insert'
const ISSUE_PROJECT_LIST_API = 'http://localhost:4567/schedule/issue/projectList'

type MemberItem = {
    userId: string
    userName: string
    email: string
}

type ProjectWithMembers = {
    projectId: number
    projectName: string
    members: MemberItem[]
}

const priorityOptions = [
    {value: '1', label: '상'},
    {value: '2', label: '중'},
    {value: '3', label: '하'},
]

export const IssueCreatePage: FC = () => {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [projectId, setProjectId] = useState<number | ''>('')
    const [issueType, setIssueType] = useState('')
    const [priority, setPriority] = useState<'1' | '2' | '3'>('2')
    const [content, setContent] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [projectList, setProjectList] = useState<ProjectWithMembers[]>([])
    const [memberList, setMemberList] = useState<MemberItem[]>([])
    const [assigneeId, setAssigneeId] = useState<string>('')

    // ---------------------------------------------
    // 1) 프로젝트 + 멤버를 한 번에 로딩
    // ---------------------------------------------
    const loadProjectList = async () => {
        try {
            const res = await axios.post(
                ISSUE_PROJECT_LIST_API,
                {},
                {withCredentials: true}
            )

            const list: ProjectWithMembers[] = res.data.projectList ?? res.data
            setProjectList(list)

            // 만약 첫 번째 프로젝트를 기본 선택으로 하고 싶다면:
            if (list.length > 0) {
                const first = list[0]
                setProjectId(first.projectId)
                setMemberList(first.members ?? [])
                setAssigneeId('') // 초기 담당자 선택은 비움
            }
        } catch (e) {
            console.error(e)
        }
    }

    // ---------------------------------------------
    // 2) 프로젝트 선택이 바뀔 때마다 멤버 리스트 변경
    // ---------------------------------------------
    useEffect(() => {
        if (!projectId) {
            setMemberList([])
            setAssigneeId('')
            return
        }

        const proj = projectList.find((p) => p.projectId === projectId)
        if (proj) {
            setMemberList(proj.members ?? [])
            // 프로젝트 바꿀 때마다 담당자 리셋
            setAssigneeId('')
        }
    }, [projectId, projectList])

    // ---------------------------------------------
    // 3) 저장
    // ---------------------------------------------
    const save = async () => {
        if (!title.trim()) {
            alert('이슈 제목을 입력해주세요.')
            return
        }
        if (!projectId) {
            alert('프로젝트를 선택해주세요.')
            return
        }
        if (!assigneeId) {
            alert('담당자를 선택해주세요.')
            return
        }

        try {
            await axios.post(
                ISSUE_INSERT_API,
                {
                    title,
                    projectId,
                    issueType,
                    priority,
                    content,
                    startDate,
                    endDate,
                    assigneeId,
                },
                {withCredentials: true}
            )

            alert('이슈가 등록되었습니다.')
            navigate('/issue')
        } catch (e) {
            console.error(e)
            alert('등록 중 오류가 발생했습니다.')
        }
    }

    // ---------------------------------------------
    // 4) 최초 로딩
    // ---------------------------------------------
    useEffect(() => {
        loadProjectList()
    }, [])

    return (
        <div className='card'>
            <div className='card-header border-0 pt-5'>
                <h3 className='card-title fw-bold fs-3'>이슈 등록</h3>
            </div>

            <div className='card-body py-5'>
                {/* 이슈 제목 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>이슈 제목</label>
                    <input
                        type='text'
                        className='form-control'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* 프로젝트 선택 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>프로젝트</label>
                    <select
                        className='form-select'
                        value={projectId}
                        onChange={(e) => {
                            const val = e.target.value
                            setProjectId(val ? Number(val) : '')
                        }}
                    >
                        <option value=''>프로젝트를 선택하세요</option>
                        {projectList.map((p) => (
                            <option key={p.projectId} value={p.projectId}>
                                {p.projectName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 이슈 타입 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>이슈 타입</label>
                    <input
                        type='text'
                        className='form-control'
                        placeholder='예: 버그, 기능개선, 문의 등'
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                    />
                </div>

                {/* 중요도 + 담당자 */}
                <div className='mb-5 row'>
                    <div className='col-md-6 mb-3'>
                        <label className='form-label fw-bold'>중요도</label>
                        <select
                            className='form-select'
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as '1' | '2' | '3')}
                        >
                            {priorityOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='col-md-6 mb-3'>
                        <label className='form-label fw-bold'>담당자</label>
                        <select
                            className='form-select'
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            disabled={!projectId}
                        >
                            <option value=''>담당자를 선택하세요</option>
                            {memberList.map((m) => (
                                <option key={m.userId} value={m.userId}>
                                    {m.userName} ({m.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 기간 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>이슈 기간</label>
                    <div className='d-flex gap-2'>
                        <input
                            type='date'
                            className='form-control'
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type='date'
                            className='form-control'
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* 내용 */}
                <div className='mb-5'>
                    <label className='form-label fw-bold'>내용</label>
                    <textarea
                        className='form-control'
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>

                {/* 버튼 */}
                <div className='d-flex justify-content-end gap-2'>
                    <button className='btn btn-light-secondary' onClick={() => navigate('/issue')}>
                        취소
                    </button>
                    <button className='btn btn-primary' onClick={save}>
                        등록
                    </button>
                </div>
            </div>
        </div>
    )
}
